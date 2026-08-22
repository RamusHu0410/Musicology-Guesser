package com.musicology.guesser.dto;

/**
 * One finished round on the end-of-game recap. The answer fields are safe here because a round only
 * appears in the summary once it has been guessed and its answer already returned.
 */
public record SummaryRoundDto(
        String roundId,
        int roundScore,
        int maxRoundScore,
        int caseNumber,
        String composerName,
        String workTitle) {
}
