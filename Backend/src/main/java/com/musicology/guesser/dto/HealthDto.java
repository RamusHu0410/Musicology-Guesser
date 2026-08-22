package com.musicology.guesser.dto;

/**
 * @param status       always {@code ok}; the app fails to start at all if the catalogue is broken,
 *                     so a reachable endpoint already means the content loaded
 * @param cases        cases in the catalogue, which doubles as the ceiling on {@code roundCount}
 * @param activeSessions sessions currently held in memory
 */
public record HealthDto(String status, int cases, int activeSessions) {
}
