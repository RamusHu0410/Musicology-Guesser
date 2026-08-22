package com.musicology.guesser.dto;

import java.util.List;

public record ExplanationDto(String summary, List<ExplanationPointDto> points) {
}
