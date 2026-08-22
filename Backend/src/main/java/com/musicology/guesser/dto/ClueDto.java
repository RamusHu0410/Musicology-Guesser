package com.musicology.guesser.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ClueDto(
        String id,
        int order,
        String type,
        String label,
        String text,
        String attribution) {
}
