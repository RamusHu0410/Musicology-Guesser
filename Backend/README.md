# Musicology Guesser — Backend

Spring Boot service implementing `Documents/API_CONTRACT.md`. The contract is the source of truth;
if something here disagrees with it, the contract wins.

There is no database. The content catalogue is a folder of JSON files read into memory once at
startup, and game sessions live in memory for as long as the process does.

## Requirements

- Java 21
- Maven — use the bundled `./mvnw`, no separate install needed

Maven on this machine defaults to a newer JDK, which Spring Boot 3.5 will not build against. Point
it at 21 first:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
```

## Running locally

```bash
cd Backend
./mvnw spring-boot:run
```

The API comes up on `http://localhost:8080`. Nothing else needs to be installed or running.

Content is read relative to the working directory, so start the app from the `Backend` folder or
set `DATA_DIR` to an absolute path.

## The data folder

```text
data/
├── reference/
│   ├── composers.json                    id, name, era
│   ├── cities.json                       id, name, country, coordinates
│   └── instrumentation-categories.json
├── cases/
│   └── case-017.json                     one file per mystery: clues, answer, explanation
└── manuscripts/
    └── case-017.svg                      the only directory exposed over HTTP
```

The split matters: `/media/**` serves the `manuscripts` folder and nothing else, so no URL can
reach a case file and read the answers out of it. Filenames are deliberately opaque
(`case-017.svg`) so the image URL gives nothing away either.

Everything is validated when it loads — unknown composer or instrumentation ids, duplicate clue
orders, explanations pointing at clues that do not exist, missing manuscript files, unknown JSON
fields. Any of these aborts startup with a message naming the file, rather than failing halfway
through a demo.

### Adding a mystery

Drop a `case-0NN.json` into `data/cases`, put its image in `data/manuscripts`, restart. No code
changes and no rebuild of the jar.

```json
{
  "id": "case-023",
  "caseNumber": 23,
  "composerId": "brahms-j",
  "workTitle": "...",
  "yearComposed": 1876,
  "cityId": "vienna",
  "instrumentationId": "orchestral",
  "manuscript": "case-023.svg",
  "clues": [
    { "order": 1, "type": "place", "label": "A place the composer worked", "text": "...", "attribution": null }
  ],
  "explanation": {
    "summary": "...",
    "points": [
      { "clueOrder": null, "text": "A point about the manuscript image itself." },
      { "clueOrder": 1, "text": "What that clue was pointing at." }
    ]
  }
}
```

`type` is one of `contemporary-account`, `letter`, `criticism`, `biographical`, `place`,
`relationship`, `musical-characteristic`, `historical-event`, `anecdote`.

Two rules when writing content:

1. **Clue text must never name the composer or the answer city.** Clues are sent to the client
   before any guess is submitted, so anything in them is public. Say "an imperial capital" rather
   than "Vienna", and let the reveal name it. Tests enforce both.
2. **Do not invent historical quotations.** Rows needing a real first-hand account are marked
   `[PLACEHOLDER]` and must be replaced with a properly cited quotation rather than filled in from
   memory. Case 017 currently carries two such placeholders (one clue, one explanation point).

The manuscript images are also placeholders — generated SVG staves, not real manuscripts. Replace
them with cropped public-domain scans (IMSLP) and update the `manuscript` filename.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATA_DIR` | `data` | Location of the content folder |
| `MEDIA_BASE_URL` | `http://localhost:8080` | Prefix for `imageUrl`; set to empty for relative URLs |
| `CORS_ORIGINS` | localhost 5173/3000 | Comma-separated browser origins allowed to call the API |

## Endpoints

| Method | Path |
| --- | --- |
| GET | `/api/composers` |
| GET | `/api/cities` |
| GET | `/api/instrumentation-categories` |
| POST | `/api/game/start` |
| POST | `/api/game/{sessionId}/rounds/{roundId}/guess` |
| GET | `/api/game/{sessionId}/summary` |
| GET | `/media/{file}` |

## Scoring

Four axes, 500 points each, 2000 per round. The server owns all of it.

- Composer, city and instrumentation are exact-match: 500 or 0.
- Year is distance-based: `500 − (10 × yearsOff)`, floored at 0, so a guess two years out scores
  480 and anything 50+ years out scores nothing. This reproduces the worked example in the
  contract. `correct` on that axis means within 5 years.

The city axis scores **where the work was written**, not where the composer was from. Cities carry
coordinates, so switching to distance-based map scoring later is a change to `ScoringService` and
the guess request shape, not to the content.

## Tests

```bash
./mvnw test
```

Tests read the same `data` folder the app serves, so a broken case file fails the build. Coverage
is deliberately narrow: reference data, session start, the scoring curve, answer-leak prevention,
double-guess rejection, not-found handling, request validation, and content-file linting.

## Notes for the frontend

- Sessions are in-memory and anonymous. A backend restart invalidates every in-flight session.
- `difficulty` on `/api/game/start` is accepted and ignored.
- `roundCount` above the number of cases is capped rather than rejected, so `maxScore` in the
  summary reflects the rounds actually dealt.
- `/api/game/{sessionId}/summary` lists only rounds that have been guessed; `maxScore` covers the
  whole session.
- Unmatched URLs return `404` with `{"error":"NOT_FOUND"}`, which is one code beyond the list in
  the contract.
