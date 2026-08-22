package com.musicology.guesser.dto;

import java.util.List;

public record StartGameResponse(String sessionId, List<RoundDto> rounds) {
}
