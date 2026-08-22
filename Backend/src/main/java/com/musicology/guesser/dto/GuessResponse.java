package com.musicology.guesser.dto;

public record GuessResponse(
        CorrectAnswerDto correct,
        ScoreBreakdownDto scoreBreakdown,
        int roundScore,
        int maxRoundScore,
        ExplanationDto explanation) {
}
