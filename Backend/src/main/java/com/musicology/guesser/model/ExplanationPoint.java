package com.musicology.guesser.model;

/**
 * One line of the post-guess reveal.
 *
 * @param clueOrder the clue this reasoning refers to, or null when the point is about the
 *                  manuscript image itself
 */
public record ExplanationPoint(Integer clueOrder, String text) {
}
