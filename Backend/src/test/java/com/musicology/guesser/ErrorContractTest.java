package com.musicology.guesser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicology.guesser.exception.ApiErrorCode;

/**
 * The frontend keys off the {@code error} string, so every failure path has to produce the same
 * two-field shape. These tests are about that shape rather than about any individual rule.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ErrorContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void missingSessionUsesTheStandardShape() throws Exception {
        assertErrorShape(
                get("/api/game/{s}/summary", "sess_nope"), 404, ApiErrorCode.SESSION_NOT_FOUND);
    }

    @Test
    void unknownRoundUsesTheStandardShape() throws Exception {
        String sessionId = startedSessionId();

        assertErrorShape(
                post("/api/game/{s}/rounds/{r}/guess", sessionId, "r404")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validGuessBody()),
                404,
                ApiErrorCode.ROUND_NOT_FOUND);
    }

    @Test
    void repeatGuessUsesTheStandardShape() throws Exception {
        String sessionId = startedSessionId();
        mockMvc.perform(post("/api/game/{s}/rounds/{r}/guess", sessionId, "r1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validGuessBody()))
                .andExpect(status().isOk());

        assertErrorShape(
                post("/api/game/{s}/rounds/{r}/guess", sessionId, "r1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validGuessBody()),
                409,
                ApiErrorCode.ROUND_ALREADY_GUESSED);
    }

    @Test
    void unparseableJsonUsesTheStandardShape() throws Exception {
        assertErrorShape(
                post("/api/game/start").contentType(MediaType.APPLICATION_JSON).content("{not json"),
                400,
                ApiErrorCode.VALIDATION_ERROR);
    }

    @Test
    void missingRequiredFieldUsesTheStandardShape() throws Exception {
        assertErrorShape(
                post("/api/game/start").contentType(MediaType.APPLICATION_JSON).content("{}"),
                400,
                ApiErrorCode.VALIDATION_ERROR);
    }

    /** A mistyped URL must not be mistaken for a missing session or round. */
    @Test
    void unmatchedPathUsesTheStandardShape() throws Exception {
        assertErrorShape(get("/api/does-not-exist"), 404, ApiErrorCode.NOT_FOUND);
    }

    private void assertErrorShape(RequestBuilder request, int expectedStatus, ApiErrorCode expectedCode)
            throws Exception {
        String payload = mockMvc.perform(request)
                .andExpect(status().is(expectedStatus))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode body = objectMapper.readTree(payload);
        assertThat(body.get("error").asText()).isEqualTo(expectedCode.name());
        assertThat(body.get("message").asText()).isNotBlank();
        assertThat(body.size()).as("error responses carry error and message only").isEqualTo(2);
    }

    private String startedSessionId() throws Exception {
        String payload = mockMvc.perform(post("/api/game/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roundCount\":1}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(payload).get("sessionId").asText();
    }

    /**
     * Deliberately wrong on every axis: these tests care about the error envelope, and a guess that
     * scores zero still exercises the same code path as one that scores well.
     */
    private String validGuessBody() {
        return """
                {"composerId":"bach-js","guessedYear":1700,"countryId":"austria","instrumentationId":"orchestral"}
                """;
    }
}
