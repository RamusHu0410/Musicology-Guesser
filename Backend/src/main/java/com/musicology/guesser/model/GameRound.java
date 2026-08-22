package com.musicology.guesser.model;

/**
 * One case as it appears inside a session. Not persisted: sessions live in memory only.
 */
public class GameRound {

    private final String roundId;
    private final String caseId;
    private Integer roundScore;

    public GameRound(String roundId, String caseId) {
        this.roundId = roundId;
        this.caseId = caseId;
    }

    public String getRoundId() {
        return roundId;
    }

    public String getCaseId() {
        return caseId;
    }

    public Integer getRoundScore() {
        return roundScore;
    }

    public boolean isGuessed() {
        return roundScore != null;
    }

    public void recordScore(int score) {
        this.roundScore = score;
    }
}
