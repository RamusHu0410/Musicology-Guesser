package com.musicology.guesser.model;

import java.util.List;

/**
 * One curated mystery, loaded from a single file in {@code data/cases}.
 *
 * @param caseNumber cosmetic number behind the "CASE #017" framing in the UI
 * @param countryId  country where this work was written, which is what the player guesses
 * @param manuscript filename within {@code data/manuscripts}
 */
public record MysteryCase(
        String id,
        int caseNumber,
        String composerId,
        String workTitle,
        int yearComposed,
        String countryId,
        String instrumentationId,
        String manuscript,
        List<Clue> clues,
        Explanation explanation) {
}
