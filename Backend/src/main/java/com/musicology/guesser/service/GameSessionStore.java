package com.musicology.guesser.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.musicology.guesser.config.AppProperties;
import com.musicology.guesser.model.GameRound;
import com.musicology.guesser.model.GameSession;

/**
 * In-memory session registry, per the API contract's decision that sessions are anonymous and
 * ephemeral. Swapping this for a persistent store later only touches this class.
 *
 * <p>Sessions are evicted once they outlive {@code app.session-ttl}, and the map is capped at
 * {@code app.max-sessions} so a long-running or scripted-against server cannot grow without bound.
 * Eviction happens on write rather than on a timer: there is no background thread to reason about,
 * and a server nobody is playing has nothing to clean up.
 */
@Component
public class GameSessionStore {

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();
    private final AppProperties properties;
    private final Clock clock;

    public GameSessionStore(AppProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public GameSession create(List<GameRound> rounds) {
        Instant now = clock.instant();
        evictExpired(now);
        evictOldestWhileOverCapacity();

        String sessionId = "sess_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        GameSession session = new GameSession(sessionId, rounds, now);
        sessions.put(sessionId, session);
        return session;
    }

    /** An expired session is indistinguishable from one that never existed, by design. */
    public Optional<GameSession> find(String sessionId) {
        GameSession session = sessions.get(sessionId);
        if (session == null) {
            return Optional.empty();
        }
        if (hasExpired(session, clock.instant())) {
            sessions.remove(sessionId, session);
            return Optional.empty();
        }
        return Optional.of(session);
    }

    /**
     * Sessions currently retained. Expired entries are swept on the next write, so this can briefly
     * exceed the number of sessions a player could still resume.
     */
    public int size() {
        return sessions.size();
    }

    private boolean hasExpired(GameSession session, Instant now) {
        return session.getCreatedAt().plus(properties.sessionTtl()).isBefore(now);
    }

    private void evictExpired(Instant now) {
        sessions.values().removeIf(session -> hasExpired(session, now));
    }

    /**
     * Runs after expiry eviction, so this only fires under genuine load rather than as a
     * consequence of accumulated dead sessions.
     */
    private void evictOldestWhileOverCapacity() {
        int capacity = properties.maxSessions();
        while (sessions.size() >= capacity) {
            Optional<GameSession> oldest = sessions.values().stream()
                    .min(Comparator.comparing(GameSession::getCreatedAt));
            if (oldest.isEmpty()) {
                return;
            }
            sessions.remove(oldest.get().getSessionId(), oldest.get());
        }
    }
}
