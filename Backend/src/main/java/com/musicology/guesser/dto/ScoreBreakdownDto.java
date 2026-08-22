package com.musicology.guesser.dto;

public record ScoreBreakdownDto(
        AxisScoreDto composer,
        AxisScoreDto era,
        AxisScoreDto country,
        AxisScoreDto instrumentation) {

    public int total() {
        return composer.points() + era.points() + country.points() + instrumentation.points();
    }

    public int maxTotal() {
        return composer.maxPoints() + era.maxPoints() + country.maxPoints() + instrumentation.maxPoints();
    }
}
