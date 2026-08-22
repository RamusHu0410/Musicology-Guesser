package com.musicology.guesser.model;

import java.util.List;

public record Explanation(String summary, List<ExplanationPoint> points) {
}
