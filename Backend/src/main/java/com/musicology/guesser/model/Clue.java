package com.musicology.guesser.model;

/**
 * A single piece of text evidence. Clue text must never name the composer: clues are sent to the
 * client before any guess is submitted.
 *
 * @param order       1-based reveal position, unique within a case
 * @param type        display hint, e.g. {@code place} or {@code historical-event}
 * @param attribution optional source or author
 */
public record Clue(int order, String type, String label, String text, String attribution) {
}
