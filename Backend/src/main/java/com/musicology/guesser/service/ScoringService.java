package com.musicology.guesser.service;

import org.springframework.stereotype.Service;

import com.musicology.guesser.dto.AxisScoreDto;
import com.musicology.guesser.dto.GuessRequest;
import com.musicology.guesser.dto.ScoreBreakdownDto;
import com.musicology.guesser.model.MysteryCase;

/**
 * Scoring lives on the server so it stays consistent and cannot be tampered with by the client.
 *
 * <p>Composer, city and instrumentation are all-or-nothing. The year axis is distance-based:
 * ten points are lost per year of error, so a guess 2 years out scores 480 and anything 50 or more
 * years out scores nothing.
 *
 * <p>The city axis scores where the <em>work</em> was written, not where the composer was born.
 */
@Service
public class ScoringService {

    static final int AXIS_MAX_POINTS = 500;
    static final int POINTS_LOST_PER_YEAR = 10;

    /** A guess within this many years still reads as "right era" in the breakdown. */
    static final int YEAR_TOLERANCE = 5;

    public ScoreBreakdownDto score(GuessRequest guess, MysteryCase mysteryCase) {
        boolean composerCorrect = mysteryCase.composerId().equals(guess.composerId());
        boolean cityCorrect = mysteryCase.cityId().equals(guess.cityId());
        boolean instrumentationCorrect = mysteryCase.instrumentationId().equals(guess.instrumentationId());

        int yearsOff = Math.abs(mysteryCase.yearComposed() - guess.guessedYear());
        int yearPoints = Math.max(0, AXIS_MAX_POINTS - (yearsOff * POINTS_LOST_PER_YEAR));

        return new ScoreBreakdownDto(
                AxisScoreDto.exactMatch(composerCorrect ? AXIS_MAX_POINTS : 0, AXIS_MAX_POINTS, composerCorrect),
                new AxisScoreDto(yearPoints, AXIS_MAX_POINTS, yearsOff <= YEAR_TOLERANCE, yearsOff),
                AxisScoreDto.exactMatch(cityCorrect ? AXIS_MAX_POINTS : 0, AXIS_MAX_POINTS, cityCorrect),
                AxisScoreDto.exactMatch(
                        instrumentationCorrect ? AXIS_MAX_POINTS : 0, AXIS_MAX_POINTS, instrumentationCorrect));
    }

    public int maxRoundScore() {
        return AXIS_MAX_POINTS * 4;
    }
}
