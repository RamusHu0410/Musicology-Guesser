package com.musicology.guesser.dto;

import java.util.List;

public record SummaryResponse(
        String sessionId,
        int totalScore,
        int maxScore,
        List<SummaryRoundDto> rounds) {
}
