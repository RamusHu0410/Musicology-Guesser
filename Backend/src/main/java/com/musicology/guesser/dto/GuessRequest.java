package com.musicology.guesser.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** {@code cityId} is where the work was written, not where the composer was born. */
public record GuessRequest(
        @NotBlank String composerId,
        @NotNull @Min(1000) @Max(2100) Integer guessedYear,
        @NotBlank String cityId,
        @NotBlank String instrumentationId) {
}
