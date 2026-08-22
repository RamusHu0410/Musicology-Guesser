package com.musicology.guesser.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.musicology.guesser.dto.HealthDto;
import com.musicology.guesser.repository.ContentRepository;
import com.musicology.guesser.service.GameSessionStore;

/**
 * A deployment target needs something cheap to poll, and during a demo it is useful to see at a
 * glance that the catalogue loaded and how many sessions are in flight. Exposes no answer data.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private final ContentRepository content;
    private final GameSessionStore sessionStore;

    public HealthController(ContentRepository content, GameSessionStore sessionStore) {
        this.content = content;
        this.sessionStore = sessionStore;
    }

    @GetMapping("/health")
    public HealthDto health() {
        return new HealthDto("ok", content.findAllCases().size(), sessionStore.size());
    }
}
