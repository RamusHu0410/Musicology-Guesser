package com.musicology.guesser.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.musicology.guesser.config.AppProperties;
import com.musicology.guesser.dto.ClueDto;
import com.musicology.guesser.dto.CorrectAnswerDto;
import com.musicology.guesser.dto.ExplanationDto;
import com.musicology.guesser.dto.ExplanationPointDto;
import com.musicology.guesser.dto.GuessRequest;
import com.musicology.guesser.dto.GuessResponse;
import com.musicology.guesser.dto.RoundDto;
import com.musicology.guesser.dto.ScoreBreakdownDto;
import com.musicology.guesser.dto.StartGameRequest;
import com.musicology.guesser.dto.StartGameResponse;
import com.musicology.guesser.dto.SummaryResponse;
import com.musicology.guesser.dto.SummaryRoundDto;
import com.musicology.guesser.exception.ApiErrorCode;
import com.musicology.guesser.exception.ApiException;
import com.musicology.guesser.model.City;
import com.musicology.guesser.model.Clue;
import com.musicology.guesser.model.Composer;
import com.musicology.guesser.model.GameRound;
import com.musicology.guesser.model.GameSession;
import com.musicology.guesser.model.MysteryCase;
import com.musicology.guesser.repository.ContentRepository;

@Service
public class GameService {

    private final ContentRepository content;
    private final GameSessionStore sessionStore;
    private final ScoringService scoringService;
    private final AppProperties properties;

    public GameService(
            ContentRepository content,
            GameSessionStore sessionStore,
            ScoringService scoringService,
            AppProperties properties) {
        this.content = content;
        this.sessionStore = sessionStore;
        this.scoringService = scoringService;
        this.properties = properties;
    }

    /**
     * Picks a random set of cases and returns every round upfront. Nothing in the payload
     * identifies the composer, so shipping all rounds at once leaks nothing.
     */
    public StartGameResponse startGame(StartGameRequest request) {
        List<MysteryCase> available = new ArrayList<>(content.findAllCases());
        if (available.isEmpty()) {
            throw new ApiException(ApiErrorCode.INTERNAL_ERROR, "No mystery cases are available");
        }

        Collections.shuffle(available);
        List<MysteryCase> selected = available.subList(0, Math.min(request.roundCount(), available.size()));

        List<GameRound> rounds = new ArrayList<>();
        for (int i = 0; i < selected.size(); i++) {
            rounds.add(new GameRound("r" + (i + 1), selected.get(i).id()));
        }

        GameSession session = sessionStore.create(rounds);

        List<RoundDto> roundDtos = new ArrayList<>();
        for (int i = 0; i < selected.size(); i++) {
            roundDtos.add(toRoundDto(rounds.get(i).getRoundId(), selected.get(i)));
        }
        return new StartGameResponse(session.getSessionId(), roundDtos);
    }

    public GuessResponse submitGuess(String sessionId, String roundId, GuessRequest guess) {
        GameSession session = requireSession(sessionId);
        GameRound round = session.findRound(roundId)
                .orElseThrow(() -> new ApiException(
                        ApiErrorCode.ROUND_NOT_FOUND, "No round with id " + roundId + " in session " + sessionId));

        requireKnownReferences(guess);

        MysteryCase mysteryCase = content.findCase(round.getCaseId())
                .orElseThrow(() -> new ApiException(
                        ApiErrorCode.INTERNAL_ERROR, "Case behind round " + roundId + " is missing"));

        ScoreBreakdownDto breakdown;
        synchronized (session) {
            if (round.isGuessed()) {
                throw new ApiException(
                        ApiErrorCode.ROUND_ALREADY_GUESSED, "Round " + roundId + " has already been guessed");
            }
            breakdown = scoringService.score(guess, mysteryCase);
            round.recordScore(breakdown.total());
        }

        return new GuessResponse(
                toCorrectAnswerDto(mysteryCase),
                breakdown,
                breakdown.total(),
                breakdown.maxTotal(),
                toExplanationDto(roundId, mysteryCase));
    }

    public SummaryResponse summary(String sessionId) {
        GameSession session = requireSession(sessionId);

        List<SummaryRoundDto> guessedRounds = session.getRounds().stream()
                .filter(GameRound::isGuessed)
                .map(this::toSummaryRoundDto)
                .toList();

        int totalScore = guessedRounds.stream().mapToInt(SummaryRoundDto::roundScore).sum();
        int maxScore = session.getRounds().size() * scoringService.maxRoundScore();

        return new SummaryResponse(session.getSessionId(), totalScore, maxScore, guessedRounds);
    }

    /** Only ever called for guessed rounds, so naming the answer here reveals nothing new. */
    private SummaryRoundDto toSummaryRoundDto(GameRound round) {
        MysteryCase mysteryCase = content.findCase(round.getCaseId())
                .orElseThrow(() -> new ApiException(
                        ApiErrorCode.INTERNAL_ERROR, "Case behind round " + round.getRoundId() + " is missing"));

        return new SummaryRoundDto(
                round.getRoundId(),
                round.getRoundScore(),
                scoringService.maxRoundScore(),
                mysteryCase.caseNumber(),
                content.requireComposer(mysteryCase.composerId()).name(),
                mysteryCase.workTitle());
    }

    private GameSession requireSession(String sessionId) {
        return sessionStore.find(sessionId)
                .orElseThrow(() -> new ApiException(
                        ApiErrorCode.SESSION_NOT_FOUND, "No session with id " + sessionId));
    }

    /** Rejects ids that do not exist, so a typo fails loudly instead of silently scoring zero. */
    private void requireKnownReferences(GuessRequest guess) {
        if (!content.composerExists(guess.composerId())) {
            throw new ApiException(ApiErrorCode.VALIDATION_ERROR, "Unknown composerId " + guess.composerId());
        }
        if (!content.cityExists(guess.cityId())) {
            throw new ApiException(ApiErrorCode.VALIDATION_ERROR, "Unknown cityId " + guess.cityId());
        }
        if (!content.instrumentationExists(guess.instrumentationId())) {
            throw new ApiException(
                    ApiErrorCode.VALIDATION_ERROR, "Unknown instrumentationId " + guess.instrumentationId());
        }
    }

    private RoundDto toRoundDto(String roundId, MysteryCase mysteryCase) {
        List<ClueDto> clues = mysteryCase.clues().stream()
                .sorted(Comparator.comparingInt(Clue::order))
                .map(clue -> new ClueDto(
                        clueId(roundId, clue.order()),
                        clue.order(),
                        clue.type(),
                        clue.label(),
                        clue.text(),
                        clue.attribution()))
                .toList();

        return new RoundDto(roundId, mysteryCase.caseNumber(), manuscriptUrl(mysteryCase), clues);
    }

    private String manuscriptUrl(MysteryCase mysteryCase) {
        String base = properties.mediaBaseUrl();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/media/" + mysteryCase.manuscript();
    }

    private CorrectAnswerDto toCorrectAnswerDto(MysteryCase mysteryCase) {
        Composer composer = content.requireComposer(mysteryCase.composerId());
        City city = content.requireCity(mysteryCase.cityId());
        return new CorrectAnswerDto(
                composer.id(),
                composer.name(),
                mysteryCase.workTitle(),
                composer.era(),
                mysteryCase.yearComposed(),
                city.id(),
                city.name(),
                mysteryCase.instrumentationId());
    }

    private ExplanationDto toExplanationDto(String roundId, MysteryCase mysteryCase) {
        List<ExplanationPointDto> points = mysteryCase.explanation().points().stream()
                .map(point -> new ExplanationPointDto(
                        point.clueOrder() == null ? null : clueId(roundId, point.clueOrder()),
                        point.text()))
                .toList();
        return new ExplanationDto(mysteryCase.explanation().summary(), points);
    }

    /** Clue ids are round-scoped so the frontend can match explanation points to evidence cards. */
    private String clueId(String roundId, int clueOrder) {
        return roundId + "c" + clueOrder;
    }
}
