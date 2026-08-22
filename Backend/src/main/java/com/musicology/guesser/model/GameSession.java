package com.musicology.guesser.model;

import java.util.List;
import java.util.Optional;

/**
 * An anonymous, in-memory play-through. Sessions do not survive a backend restart.
 */
public class GameSession {

    private final String sessionId;
    private final List<GameRound> rounds;

    public GameSession(String sessionId, List<GameRound> rounds) {
        this.sessionId = sessionId;
        this.rounds = List.copyOf(rounds);
    }

    public String getSessionId() {
        return sessionId;
    }

    public List<GameRound> getRounds() {
        return rounds;
    }

    public Optional<GameRound> findRound(String roundId) {
        return rounds.stream().filter(round -> round.getRoundId().equals(roundId)).findFirst();
    }
}
