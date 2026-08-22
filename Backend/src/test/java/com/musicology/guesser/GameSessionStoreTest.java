package com.musicology.guesser;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.musicology.guesser.config.AppProperties;
import com.musicology.guesser.model.GameRound;
import com.musicology.guesser.model.GameSession;
import com.musicology.guesser.service.GameSessionStore;

/**
 * Sessions are held in memory, so the store has to forget them eventually. Driven by a movable
 * clock rather than real time so the tests stay instant.
 */
class GameSessionStoreTest {

    private static final Duration TTL = Duration.ofHours(2);

    private final MovableClock clock = new MovableClock(Instant.parse("2026-01-01T12:00:00Z"));
    private final GameSessionStore store = new GameSessionStore(properties(TTL, 3), clock);

    @Test
    void aFreshSessionIsFound() {
        GameSession session = store.create(rounds());

        assertThat(store.find(session.getSessionId())).containsSame(session);
    }

    @Test
    void aSessionSurvivesRightUpToItsTtl() {
        GameSession session = store.create(rounds());

        clock.advance(TTL);

        assertThat(store.find(session.getSessionId())).isPresent();
    }

    @Test
    void anExpiredSessionReadsAsMissing() {
        GameSession session = store.create(rounds());

        clock.advance(TTL.plusMinutes(1));

        assertThat(store.find(session.getSessionId())).isEmpty();
    }

    @Test
    void expiredSessionsAreDroppedRatherThanAccumulating() {
        store.create(rounds());
        store.create(rounds());

        clock.advance(TTL.plusMinutes(1));
        store.create(rounds());

        assertThat(store.size()).isEqualTo(1);
    }

    @Test
    void theCapDropsTheOldestSessionFirst() {
        GameSession oldest = store.create(rounds());
        clock.advance(Duration.ofMinutes(1));
        GameSession middle = store.create(rounds());
        clock.advance(Duration.ofMinutes(1));
        GameSession newest = store.create(rounds());

        clock.advance(Duration.ofMinutes(1));
        GameSession fourth = store.create(rounds());

        assertThat(store.size()).isEqualTo(3);
        assertThat(store.find(oldest.getSessionId())).isEmpty();
        assertThat(store.find(middle.getSessionId())).isPresent();
        assertThat(store.find(newest.getSessionId())).isPresent();
        assertThat(store.find(fourth.getSessionId())).isPresent();
    }

    private static AppProperties properties(Duration ttl, int maxSessions) {
        return new AppProperties("data", "", List.of(), ttl, maxSessions);
    }

    private static List<GameRound> rounds() {
        return List.of(new GameRound("r1", "case-017"));
    }

    private static final class MovableClock extends Clock {

        private Instant now;

        private MovableClock(Instant now) {
            this.now = now;
        }

        private void advance(Duration amount) {
            now = now.plus(amount);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }
    }
}
