package com.musicology.guesser.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.musicology.guesser.dto.GuessRequest;
import com.musicology.guesser.dto.GuessResponse;
import com.musicology.guesser.dto.StartGameRequest;
import com.musicology.guesser.dto.StartGameResponse;
import com.musicology.guesser.dto.SummaryResponse;
import com.musicology.guesser.service.GameService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/start")
    public StartGameResponse start(@Valid @RequestBody StartGameRequest request) {
        return gameService.startGame(request);
    }

    @PostMapping("/{sessionId}/rounds/{roundId}/guess")
    public GuessResponse guess(
            @PathVariable String sessionId,
            @PathVariable String roundId,
            @Valid @RequestBody GuessRequest request) {
        return gameService.submitGuess(sessionId, roundId, request);
    }

    @GetMapping("/{sessionId}/summary")
    public SummaryResponse summary(@PathVariable String sessionId) {
        return gameService.summary(sessionId);
    }
}
