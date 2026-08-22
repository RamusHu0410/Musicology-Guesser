package com.musicology.guesser.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * {@code difficulty} is accepted but has no defined effect yet.
 *
 * <p>{@code roundCount} is capped at the size of the case catalogue rather than rejected, so the
 * response may contain fewer rounds than were asked for.
 */
public record StartGameRequest(
        @NotNull @Min(1) @Max(20) Integer roundCount,
        String difficulty) {
}
