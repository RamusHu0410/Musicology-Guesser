package com.musicology.guesser.repository;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicology.guesser.config.AppProperties;
import com.musicology.guesser.model.City;
import com.musicology.guesser.model.Clue;
import com.musicology.guesser.model.Composer;
import com.musicology.guesser.model.ExplanationPoint;
import com.musicology.guesser.model.MysteryCase;
import com.musicology.guesser.model.ReferenceItem;

/**
 * Reads the whole content catalogue from the data directory once at startup and keeps it in
 * memory. The catalogue is small, curated and read-only at runtime, so a database would buy
 * nothing here.
 *
 * <p>Everything is validated on load and a problem aborts startup rather than surfacing as a
 * broken round mid-demo.
 */
@Repository
public class ContentRepository {

    private static final Logger log = LoggerFactory.getLogger(ContentRepository.class);

    private final List<Composer> composers;
    private final Map<String, Composer> composersById;
    private final List<City> cities;
    private final Map<String, City> citiesById;
    private final List<ReferenceItem> instrumentationCategories;
    private final List<MysteryCase> cases;
    private final Map<String, MysteryCase> casesById;

    public ContentRepository(AppProperties properties) {
        Path dataDir = Path.of(properties.dataDir()).toAbsolutePath().normalize();
        requireDirectory(dataDir, "data directory");

        // A dedicated mapper, left at Jackson's strict defaults, so a typo in a content file fails
        // loudly instead of silently deserialising to null.
        ObjectMapper mapper = new ObjectMapper();

        this.composers = readList(mapper, dataDir.resolve("reference/composers.json"), new TypeReference<>() {});
        this.cities = readList(mapper, dataDir.resolve("reference/cities.json"), new TypeReference<>() {});
        this.instrumentationCategories = readList(
                mapper, dataDir.resolve("reference/instrumentation-categories.json"), new TypeReference<>() {});
        this.cases = readCases(mapper, dataDir.resolve("cases"));

        this.composersById = index(composers, Composer::id, "composer");
        this.citiesById = index(cities, City::id, "city");
        this.casesById = index(cases, MysteryCase::id, "case");

        validate(dataDir);

        log.info(
                "Loaded {} composers, {} cities and {} mystery cases from {}",
                composers.size(),
                cities.size(),
                cases.size(),
                dataDir);
    }

    public List<Composer> findAllComposers() {
        return composers;
    }

    public boolean composerExists(String id) {
        return composersById.containsKey(id);
    }

    public Composer requireComposer(String id) {
        Composer composer = composersById.get(id);
        if (composer == null) {
            throw new IllegalStateException("Unknown composerId " + id);
        }
        return composer;
    }

    public List<City> findAllCities() {
        return cities;
    }

    public boolean cityExists(String id) {
        return citiesById.containsKey(id);
    }

    public City requireCity(String id) {
        City city = citiesById.get(id);
        if (city == null) {
            throw new IllegalStateException("Unknown cityId " + id);
        }
        return city;
    }

    public List<ReferenceItem> findAllInstrumentationCategories() {
        return instrumentationCategories;
    }

    public boolean instrumentationExists(String id) {
        return instrumentationCategories.stream().anyMatch(category -> category.id().equals(id));
    }

    public List<MysteryCase> findAllCases() {
        return cases;
    }

    public Optional<MysteryCase> findCase(String id) {
        return Optional.ofNullable(casesById.get(id));
    }

    private List<MysteryCase> readCases(ObjectMapper mapper, Path caseDir) {
        requireDirectory(caseDir, "cases directory");
        try (Stream<Path> files = Files.list(caseDir)) {
            List<MysteryCase> loaded = new ArrayList<>();
            for (Path file : files.filter(path -> path.getFileName().toString().endsWith(".json")).toList()) {
                loaded.add(read(mapper, file, new TypeReference<MysteryCase>() {}));
            }
            if (loaded.isEmpty()) {
                throw new IllegalStateException("No case files found in " + caseDir);
            }
            loaded.sort(Comparator.comparingInt(MysteryCase::caseNumber));
            return List.copyOf(loaded);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not list " + caseDir, e);
        }
    }

    private <T> List<T> readList(ObjectMapper mapper, Path file, TypeReference<List<T>> type) {
        List<T> values = read(mapper, file, type);
        if (values.isEmpty()) {
            throw new IllegalStateException("Content file is empty: " + file);
        }
        return List.copyOf(values);
    }

    private <T> T read(ObjectMapper mapper, Path file, TypeReference<T> type) {
        if (!Files.isRegularFile(file)) {
            throw new IllegalStateException("Missing content file: " + file);
        }
        try {
            return mapper.readValue(Files.readString(file), type);
        } catch (IOException e) {
            throw new IllegalStateException("Could not parse " + file + ": " + e.getMessage(), e);
        }
    }

    private <T> Map<String, T> index(List<T> values, Function<T, String> idOf, String label) {
        Map<String, T> byId = new LinkedHashMap<>();
        for (T value : values) {
            String id = idOf.apply(value);
            if (id == null || id.isBlank()) {
                throw new IllegalStateException("Blank " + label + " id in content files");
            }
            if (byId.put(id, value) != null) {
                throw new IllegalStateException("Duplicate " + label + " id: " + id);
            }
        }
        return Map.copyOf(byId);
    }

    private void validate(Path dataDir) {
        Path manuscriptDir = dataDir.resolve("manuscripts");
        requireDirectory(manuscriptDir, "manuscripts directory");

        for (MysteryCase mysteryCase : cases) {
            String where = "Case " + mysteryCase.id();

            if (!composersById.containsKey(mysteryCase.composerId())) {
                throw new IllegalStateException(
                        where + " references unknown composerId " + mysteryCase.composerId());
            }
            if (!citiesById.containsKey(mysteryCase.cityId())) {
                throw new IllegalStateException(where + " references unknown cityId " + mysteryCase.cityId());
            }
            if (!instrumentationExists(mysteryCase.instrumentationId())) {
                throw new IllegalStateException(
                        where + " references unknown instrumentationId " + mysteryCase.instrumentationId());
            }
            validateManuscript(where, manuscriptDir, mysteryCase.manuscript());
            validateClues(where, mysteryCase.clues());
            validateExplanation(where, mysteryCase);
        }
    }

    private void validateManuscript(String where, Path manuscriptDir, String manuscript) {
        if (manuscript == null || manuscript.isBlank()) {
            throw new IllegalStateException(where + " has no manuscript filename");
        }
        if (manuscript.contains("/") || manuscript.contains("\\") || manuscript.contains("..")) {
            throw new IllegalStateException(
                    where + " manuscript must be a plain filename inside data/manuscripts, got " + manuscript);
        }
        if (!Files.isRegularFile(manuscriptDir.resolve(manuscript))) {
            throw new IllegalStateException(where + " references missing manuscript " + manuscript);
        }
    }

    private void validateClues(String where, List<Clue> clues) {
        if (clues == null || clues.isEmpty()) {
            throw new IllegalStateException(where + " has no clues");
        }
        List<Integer> orders = clues.stream().map(Clue::order).toList();
        if (orders.stream().distinct().count() != orders.size()) {
            throw new IllegalStateException(where + " has duplicate clue order values");
        }
        if (orders.stream().anyMatch(order -> order < 1)) {
            throw new IllegalStateException(where + " has a clue with a non-positive order");
        }
    }

    private void validateExplanation(String where, MysteryCase mysteryCase) {
        if (mysteryCase.explanation() == null || mysteryCase.explanation().summary() == null) {
            throw new IllegalStateException(where + " has no explanation summary");
        }
        List<Integer> clueOrders = mysteryCase.clues().stream().map(Clue::order).toList();
        for (ExplanationPoint point : mysteryCase.explanation().points()) {
            if (point.clueOrder() != null && !clueOrders.contains(point.clueOrder())) {
                throw new IllegalStateException(
                        where + " explanation references clue order " + point.clueOrder() + ", which does not exist");
            }
        }
    }

    private void requireDirectory(Path path, String label) {
        if (!Files.isDirectory(path)) {
            throw new IllegalStateException(
                    "Missing " + label + ": " + path + " (set app.data-dir or run from the Backend folder)");
        }
    }
}
