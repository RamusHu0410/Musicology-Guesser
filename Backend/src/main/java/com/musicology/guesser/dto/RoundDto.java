package com.musicology.guesser.dto;

import java.util.List;

public record RoundDto(String roundId, int caseNumber, String imageUrl, List<ClueDto> clues) {
}
