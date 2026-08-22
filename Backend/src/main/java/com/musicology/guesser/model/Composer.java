package com.musicology.guesser.model;

/**
 * Loaded from {@code data/reference/composers.json}.
 *
 * <p>Location is deliberately not held here: the player guesses where the <em>work</em> was
 * written, which is a property of the case rather than the composer.
 */
public record Composer(String id, String name, String era) {
}
