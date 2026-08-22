package com.musicology.guesser.dto;

/** A null {@code clueId} is serialised explicitly: it means the point is about the manuscript. */
public record ExplanationPointDto(String clueId, String text) {
}
