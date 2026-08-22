package com.musicology.guesser.model;

/**
 * A place a work could have been written, loaded from {@code data/reference/cities.json}.
 *
 * <p>Coordinates are carried so the frontend can place the city on a map, and so scoring can move
 * from exact match to map distance later without a data migration.
 */
public record City(String id, String name, String country, double lat, double lon) {
}
