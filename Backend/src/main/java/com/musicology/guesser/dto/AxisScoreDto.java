package com.musicology.guesser.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/** {@code yearsOff} is only present on the year-distance axis. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AxisScoreDto(int points, int maxPoints, boolean correct, Integer yearsOff) {

    public static AxisScoreDto exactMatch(int points, int maxPoints, boolean correct) {
        return new AxisScoreDto(points, maxPoints, correct, null);
    }
}
