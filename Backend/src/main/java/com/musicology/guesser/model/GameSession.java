package com.musicology.guesser.model;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * An anonymous, in-memory play-through. Sessions do not survive a backend restart, and are
 * evicted once they pass the configured time-to-live.
 */
public class GameSession {

    private final String sessionId;
    private final List<GameRound> rounds;
    private final Instant createdAt;

    public GameSession(String sessionId, List<GameRound> rounds, Instant createdAt) {
        this.sessionId = sessionId;
        this.rounds = List.copyOf(rounds);
        this.createdAt = createdAt;
    }

    public String getSessionId() {
        return sessionId;
    }

    public List<GameRound> getRounds() {
        return rounds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Optional<GameRound> findRound(String roundId) {
        return rounds.stream().filter(round -> round.getRoundId().equals(roundId)).findFirst();
    }
}
