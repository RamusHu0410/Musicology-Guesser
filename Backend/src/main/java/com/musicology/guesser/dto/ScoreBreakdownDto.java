package com.musicology.guesser.dto;

public record ScoreBreakdownDto(
        AxisScoreDto composer,
        AxisScoreDto era,
        AxisScoreDto city,
        AxisScoreDto instrumentation) {

    public int total() {
        return composer.points() + era.points() + city.points() + instrumentation.points();
    }

    public int maxTotal() {
        return composer.maxPoints() + era.maxPoints() + city.maxPoints() + instrumentation.maxPoints();
    }
}
