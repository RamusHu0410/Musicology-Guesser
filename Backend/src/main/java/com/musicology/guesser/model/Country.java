package com.musicology.guesser.model;

/**
 * A country a work could have been written in, loaded from {@code data/reference/countries.json}.
 *
 * <p>Coordinates are the conventional capital, so the frontend can place a marker on a map.
 */
public record Country(String id, String name, double lat, double lon) {
}
