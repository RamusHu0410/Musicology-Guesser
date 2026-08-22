package com.musicology.guesser.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param dataDir      directory holding the content catalogue, relative to the working directory
 * @param mediaBaseUrl prefix applied to manuscript URLs handed to the frontend; empty yields
 *                     relative URLs
 * @param corsOrigins  browser origins allowed to call the API during local development
 * @param sessionTtl   how long an idle session stays playable before it is evicted
 * @param maxSessions  ceiling on concurrent sessions held in memory; the oldest are dropped first
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String dataDir,
        String mediaBaseUrl,
        List<String> corsOrigins,
        Duration sessionTtl,
        Integer maxSessions) {

    /** Defaults live here as well as in application.properties so tests need not restate them. */
    public AppProperties {
        mediaBaseUrl = mediaBaseUrl == null ? "" : mediaBaseUrl;
        corsOrigins = corsOrigins == null
                ? List.of(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000")
                : List.copyOf(corsOrigins);
        sessionTtl = (sessionTtl == null || sessionTtl.isZero() || sessionTtl.isNegative())
                ? Duration.ofHours(2)
                : sessionTtl;
        // A non-positive cap would make the eviction loop never terminate.
        maxSessions = (maxSessions == null || maxSessions < 1) ? 500 : maxSessions;
    }
}
