package com.musicology.guesser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicology.guesser.model.City;
import com.musicology.guesser.model.Composer;
import com.musicology.guesser.model.MysteryCase;
import com.musicology.guesser.repository.ContentRepository;

@SpringBootTest
@AutoConfigureMockMvc
class GameApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContentRepository content;

    @Test
    void startReturnsRoundsWithOrderedClues() throws Exception {
        JsonNode game = startGame(3);

        assertThat(game.get("sessionId").asText()).startsWith("sess_");
        assertThat(game.get("rounds")).hasSize(3);

        JsonNode firstRound = game.get("rounds").get(0);
        assertThat(firstRound.get("roundId").asText()).isEqualTo("r1");
        assertThat(firstRound.get("imageUrl").asText()).contains("/media/");
        assertThat(firstRound.get("caseNumber").asInt()).isPositive();

        JsonNode clues = firstRound.get("clues");
        assertThat(clues).isNotEmpty();
        assertThat(clues.get(0).get("id").asText()).isEqualTo("r1c1");
        assertThat(clues.get(0).get("order").asInt()).isEqualTo(1);
        assertThat(clues.get(0).get("text").asText()).isNotBlank();
    }

    /** The whole game depends on the answers staying hidden until a guess is submitted. */
    @Test
    void startLeaksNoAnswerData() throws Exception {
        String payload = startGameRaw(20);

        for (Composer composer : content.findAllComposers()) {
            assertThat(payload).doesNotContain(composer.name());
            assertThat(payload).doesNotContain(composer.id());
        }
        for (MysteryCase mysteryCase : content.findAllCases()) {
            assertThat(payload).doesNotContain(mysteryCase.workTitle());
            assertThat(payload).doesNotContain(content.requireCity(mysteryCase.cityId()).name());
        }
    }

    @Test
    void perfectGuessScoresEveryAxis() throws Exception {
        JsonNode game = startGame(1);
        String sessionId = game.get("sessionId").asText();
        MysteryCase answer = caseBehind(game.get("rounds").get(0));
        Composer composer = content.requireComposer(answer.composerId());
        City city = content.requireCity(answer.cityId());

        mockMvc.perform(guess(sessionId, "r1", answer, answer.yearComposed()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct.composerId").value(composer.id()))
                .andExpect(jsonPath("$.correct.composerName").value(composer.name()))
                .andExpect(jsonPath("$.correct.workTitle").value(answer.workTitle()))
                .andExpect(jsonPath("$.correct.yearComposed").value(answer.yearComposed()))
                .andExpect(jsonPath("$.correct.cityId").value(city.id()))
                .andExpect(jsonPath("$.correct.cityName").value(city.name()))
                .andExpect(jsonPath("$.scoreBreakdown.composer.points").value(500))
                .andExpect(jsonPath("$.scoreBreakdown.era.points").value(500))
                .andExpect(jsonPath("$.scoreBreakdown.era.yearsOff").value(0))
                .andExpect(jsonPath("$.scoreBreakdown.city.points").value(500))
                .andExpect(jsonPath("$.roundScore").value(2000))
                .andExpect(jsonPath("$.maxRoundScore").value(2000))
                .andExpect(jsonPath("$.explanation.summary").isNotEmpty())
                .andExpect(jsonPath("$.explanation.points").isNotEmpty());
    }

    /** Ten points per year of error, matching the worked example in the API contract. */
    @Test
    void yearErrorCostsTenPointsPerYear() throws Exception {
        JsonNode game = startGame(1);
        String sessionId = game.get("sessionId").asText();
        MysteryCase answer = caseBehind(game.get("rounds").get(0));

        mockMvc.perform(guess(sessionId, "r1", answer, answer.yearComposed() + 2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scoreBreakdown.era.points").value(480))
                .andExpect(jsonPath("$.scoreBreakdown.era.yearsOff").value(2))
                .andExpect(jsonPath("$.scoreBreakdown.era.correct").value(true))
                .andExpect(jsonPath("$.roundScore").value(1980));
    }

    /** The city axis scores where the work was written, not where the composer came from. */
    @Test
    void wrongCityScoresNothingOnThatAxis() throws Exception {
        JsonNode game = startGame(1);
        String sessionId = game.get("sessionId").asText();
        MysteryCase answer = caseBehind(game.get("rounds").get(0));
        Composer composer = content.requireComposer(answer.composerId());

        String otherCityId = content.findAllCities().stream()
                .map(City::id)
                .filter(id -> !id.equals(answer.cityId()))
                .findFirst()
                .orElseThrow();

        String body = """
                {"composerId":"%s","guessedYear":%d,"cityId":"%s","instrumentationId":"%s"}
                """.formatted(composer.id(), answer.yearComposed(), otherCityId, answer.instrumentationId());

        mockMvc.perform(post("/api/game/{s}/rounds/{r}/guess", sessionId, "r1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scoreBreakdown.city.points").value(0))
                .andExpect(jsonPath("$.scoreBreakdown.city.correct").value(false))
                .andExpect(jsonPath("$.scoreBreakdown.composer.points").value(500))
                .andExpect(jsonPath("$.correct.cityId").value(answer.cityId()))
                .andExpect(jsonPath("$.roundScore").value(1500));
    }

    @Test
    void wrongComposerScoresNothingOnThatAxis() throws Exception {
        JsonNode game = startGame(1);
        String sessionId = game.get("sessionId").asText();
        MysteryCase answer = caseBehind(game.get("rounds").get(0));

        String otherComposerId = content.findAllComposers().stream()
                .map(Composer::id)
                .filter(id -> !id.equals(answer.composerId()))
                .findFirst()
                .orElseThrow();

        String body = """
                {"composerId":"%s","guessedYear":%d,"cityId":"%s","instrumentationId":"%s"}
                """.formatted(otherComposerId, answer.yearComposed(), answer.cityId(), answer.instrumentationId());

        mockMvc.perform(post("/api/game/{s}/rounds/{r}/guess", sessionId, "r1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scoreBreakdown.composer.points").value(0))
                .andExpect(jsonPath("$.scoreBreakdown.composer.correct").value(false))
                .andExpect(jsonPath("$.correct.composerId").value(answer.composerId()));
    }

    @Test
    void secondGuessOnSameRoundIsRejected() throws Exception {
        JsonNode game = startGame(1);
        String sessionId = game.get("sessionId").asText();
        MysteryCase answer = caseBehind(game.get("rounds").get(0));

        mockMvc.perform(guess(sessionId, "r1", answer, answer.yearComposed()))
                .andExpect(status().isOk());

        mockMvc.perform(guess(sessionId, "r1", answer, answer.yearComposed()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("ROUND_ALREADY_GUESSED"));
    }

    @Test
    void unknownSessionIsNotFound() throws Exception {
        MysteryCase answer = content.findAllCases().getFirst();

        mockMvc.perform(guess("sess_missing", "r1", answer, answer.yearComposed()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("SESSION_NOT_FOUND"));

        mockMvc.perform(get("/api/game/{s}/summary", "sess_missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("SESSION_NOT_FOUND"));
    }

    @Test
    void unknownRoundIsNotFound() throws Exception {
        JsonNode game = startGame(1);
        MysteryCase answer = caseBehind(game.get("rounds").get(0));

        mockMvc.perform(guess(game.get("sessionId").asText(), "r99", answer, answer.yearComposed()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("ROUND_NOT_FOUND"));
    }

    @Test
    void missingGuessFieldsAreRejected() throws Exception {
        JsonNode game = startGame(1);

        mockMvc.perform(post("/api/game/{s}/rounds/{r}/guess", game.get("sessionId").asText(), "r1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"guessedYear\":1840}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void unknownCityIdIsRejected() throws Exception {
        JsonNode game = startGame(1);
        MysteryCase answer = caseBehind(game.get("rounds").get(0));

        String body = """
                {"composerId":"%s","guessedYear":%d,"cityId":"atlantis","instrumentationId":"%s"}
                """.formatted(answer.composerId(), answer.yearComposed(), answer.instrumentationId());

        mockMvc.perform(post("/api/game/{s}/rounds/{r}/guess", game.get("sessionId").asText(), "r1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void invalidRoundCountIsRejected() throws Exception {
        mockMvc.perform(post("/api/game/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roundCount\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    /** Asking for more rounds than there are cases deals what exists rather than failing. */
    @Test
    void roundCountIsCappedAtTheNumberOfCases() throws Exception {
        JsonNode game = startGame(20);

        assertThat(game.get("rounds")).hasSize(content.findAllCases().size());
    }

    @Test
    void summaryTotalsGuessedRounds() throws Exception {
        JsonNode game = startGame(2);
        String sessionId = game.get("sessionId").asText();
        MysteryCase answer = caseBehind(game.get("rounds").get(0));

        mockMvc.perform(guess(sessionId, "r1", answer, answer.yearComposed()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/game/{s}/summary", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(sessionId))
                .andExpect(jsonPath("$.totalScore").value(2000))
                .andExpect(jsonPath("$.maxScore").value(4000))
                .andExpect(jsonPath("$.rounds.length()").value(1))
                .andExpect(jsonPath("$.rounds[0].roundId").value("r1"))
                .andExpect(jsonPath("$.rounds[0].roundScore").value(2000));
    }

    private JsonNode startGame(int roundCount) throws Exception {
        return objectMapper.readTree(startGameRaw(roundCount));
    }

    private String startGameRaw(int roundCount) throws Exception {
        byte[] payload = mockMvc.perform(post("/api/game/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roundCount\":%d,\"difficulty\":\"normal\"}".formatted(roundCount)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();
        return new String(payload, StandardCharsets.UTF_8);
    }

    private MysteryCase caseBehind(JsonNode round) {
        int caseNumber = round.get("caseNumber").asInt();
        return content.findAllCases().stream()
                .filter(mysteryCase -> mysteryCase.caseNumber() == caseNumber)
                .findFirst()
                .orElseThrow();
    }

    private MockHttpServletRequestBuilder guess(
            String sessionId, String roundId, MysteryCase answer, int guessedYear) {
        String body = """
                {"composerId":"%s","guessedYear":%d,"cityId":"%s","instrumentationId":"%s"}
                """.formatted(answer.composerId(), guessedYear, answer.cityId(), answer.instrumentationId());
        return post("/api/game/{s}/rounds/{r}/guess", sessionId, roundId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body);
    }
}
