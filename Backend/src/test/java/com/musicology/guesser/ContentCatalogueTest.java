package com.musicology.guesser;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.musicology.guesser.model.Clue;
import com.musicology.guesser.model.Composer;
import com.musicology.guesser.model.MysteryCase;
import com.musicology.guesser.repository.ContentRepository;

/**
 * Guards the content files themselves. Loading the catalogue already validates cross-references
 * and fails startup on a broken file, so reaching these assertions means the data parsed cleanly.
 */
@SpringBootTest
class ContentCatalogueTest {

    @Autowired
    private ContentRepository content;

    @Test
    void catalogueLoads() {
        assertThat(content.findAllCases()).isNotEmpty();
        assertThat(content.findAllComposers()).isNotEmpty();
        assertThat(content.findAllCities()).isNotEmpty();
        assertThat(content.findAllInstrumentationCategories()).isNotEmpty();
    }

    /**
     * The city axis is only a puzzle if the clues make the player infer the place rather than
     * read it off the page.
     */
    @Test
    void noClueNamesItsCity() {
        for (MysteryCase mysteryCase : content.findAllCases()) {
            String cityName = content.requireCity(mysteryCase.cityId()).name();

            for (Clue clue : mysteryCase.clues()) {
                assertThat(clue.text())
                        .as("clue %d of %s must not name %s", clue.order(), mysteryCase.id(), cityName)
                        .doesNotContain(cityName);
            }
        }
    }

    /** A clue that names its own composer gives the answer away before the guess is submitted. */
    @Test
    void noClueNamesItsComposer() {
        for (MysteryCase mysteryCase : content.findAllCases()) {
            Composer composer = content.requireComposer(mysteryCase.composerId());
            String surname = composer.name().substring(composer.name().lastIndexOf(' ') + 1);

            for (Clue clue : mysteryCase.clues()) {
                assertThat(clue.text())
                        .as("clue %d of %s must not name %s", clue.order(), mysteryCase.id(), composer.name())
                        .doesNotContain(composer.name())
                        .doesNotContain(surname);
                assertThat(clue.label()).doesNotContain(surname);
            }
        }
    }

    /** The reveal is where the player learns the place, so it should say it outright. */
    @Test
    void everyExplanationNamesItsCity() {
        for (MysteryCase mysteryCase : content.findAllCases()) {
            String cityName = content.requireCity(mysteryCase.cityId()).name();
            String reveal = mysteryCase.explanation().summary()
                    + mysteryCase.explanation().points().stream().map(point -> point.text()).reduce("", String::concat);

            assertThat(reveal)
                    .as("the reveal for %s should name %s", mysteryCase.id(), cityName)
                    .contains(cityName);
        }
    }

    @Test
    void everyCaseExplainsItself() {
        for (MysteryCase mysteryCase : content.findAllCases()) {
            assertThat(mysteryCase.explanation().summary()).isNotBlank();
            assertThat(mysteryCase.explanation().points()).isNotEmpty();
        }
    }
}
