package com.musicology.guesser.dto;

public record CorrectAnswerDto(
        String composerId,
        String composerName,
        String workTitle,
        String era,
        int yearComposed,
        String cityId,
        String cityName,
        String instrumentationId) {
}
