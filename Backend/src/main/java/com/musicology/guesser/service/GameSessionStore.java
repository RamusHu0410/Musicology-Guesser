package com.musicology.guesser.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.musicology.guesser.model.GameRound;
import com.musicology.guesser.model.GameSession;

/**
 * In-memory session registry, per the API contract's decision that sessions are anonymous and
 * ephemeral. Swapping this for a persistent store later only touches this class.
 */
@Component
public class GameSessionStore {

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();

    public GameSession create(List<GameRound> rounds) {
        String sessionId = "sess_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        GameSession session = new GameSession(sessionId, rounds);
        sessions.put(sessionId, session);
        return session;
    }

    public Optional<GameSession> find(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }
}
