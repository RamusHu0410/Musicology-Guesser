# Musicology Guesser — Frontend ↔ Backend API Contract

This is the frontend's expected contract for the backend (Java). It's a starting point — if
something is awkward to implement server-side, we can adjust field names/shapes together, but the
overall shapes (rounds, reference lists, guess → result) should stay stable since the whole game
loop is built around them.

Base path assumed: `/api`. Format: JSON over HTTPS. No auth assumed yet (add a session/user id
later if accounts are needed).

---

## 1. Reference data (fetched once per app load, rarely changes)

### `GET /api/composers`
List of all composers the game can ask about — used to power the composer search/autocomplete.

```json
[
  { "id": "bach-js", "name": "Johann Sebastian Bach", "era": "baroque" },
  { "id": "chopin-f", "name": "Frédéric Chopin", "era": "romantic" }
]
```

Composers carry no location. The location axis is about **where the individual work was written**,
which belongs to the case rather than the composer — see `GET /api/cities` below.

### `GET /api/cities`
The places a work could have been written, used to power the location guess. Replaces the earlier
`GET /api/regions`: regions were too coarse to be interesting when nearly every composer in the
catalogue is European.

```json
[
  { "id": "vienna", "name": "Vienna", "country": "Austria", "lat": 48.2082, "lon": 16.3738 },
  { "id": "valldemossa", "name": "Valldemossa", "country": "Spain", "lat": 39.7097, "lon": 2.6225 }
]
```

Coordinates are included so the list can be rendered on a map. Scoring is currently exact match on
`cityId`; the coordinates mean we can switch to GeoGuessr-style distance scoring later without
changing the data or the request shape.

### `GET /api/instrumentation-categories`
```json
[
  { "id": "solo-piano", "name": "Solo Piano" },
  { "id": "string-quartet", "name": "String Quartet" },
  { "id": "orchestral", "name": "Orchestral" },
  { "id": "vocal-opera", "name": "Vocal / Opera" }
]
```

Eras themselves (Medieval/Renaissance/Baroque/Classical/Romantic/Modern/Contemporary + their year
ranges) will be hardcoded as a frontend constant, not fetched — flag if backend needs to be the
source of truth for these instead.

---

## 2. Game session

### `POST /api/game/start`
Request:
```json
{ "roundCount": 5, "difficulty": "normal" }
```
Response:
```json
{
  "sessionId": "sess_abc123",
  "rounds": [
    {
      "roundId": "r1",
      "caseNumber": 17,
      "imageUrl": "https://.../excerpts/r1.png",
      "clues": [
        {
          "id": "r1c1",
          "order": 1,
          "type": "contemporary-account",
          "label": "A first-hand description from a contemporary",
          "text": "He played with a rubato that no other pianist could imitate...",
          "attribution": "Wilhelm von Lenz, 1842"
        },
        {
          "id": "r1c2",
          "order": 2,
          "type": "historical-event",
          "label": "A historical event connected to the composer",
          "text": "The winter of 1838–39 was spent in an abandoned monastery on Mallorca."
        }
      ]
    },
    { "roundId": "r2", "caseNumber": 18, "imageUrl": "https://.../excerpts/r2.png", "clues": [] }
  ]
}
```
Notes:
- `imageUrl` points to an already-cropped PNG/JPG of the manuscript/score excerpt (backend owns
  cropping/rendering from the source PDF — frontend just displays an image). **This is the only
  image in a round.** All other evidence is text.
- `clues` is the round's remaining evidence, already sorted by `order`. Send them all upfront and
  let the frontend reveal them one at a time — clue text never contains answer data, so nothing
  leaks by shipping them early, and this avoids a per-clue round trip mid-game.
- `type` is a display hint for the evidence card, one of: `contemporary-account`, `letter`,
  `criticism`, `biographical`, `place`, `relationship`, `musical-characteristic`,
  `historical-event`, `anecdote`. Treat unknown values as generic text rather than erroring.
- `label` is a short human-readable caption for the evidence card ("Evidence 02" numbering is
  frontend-owned, derived from `order`). `attribution` is optional (source/author/date).
- `caseNumber` is cosmetic, for the "CASE #017" framing.
- No answer data is included here — the composer is only revealed after a guess is submitted.
  Clue text must never name the composer, and `imageUrl` paths must be opaque (`/media/r1.png`,
  never `/chopin-nocturne-op9.png`).

---

## 3. Submitting a guess

### `POST /api/game/{sessionId}/rounds/{roundId}/guess`
Request:
```json
{
  "composerId": "chopin-f",
  "guessedYear": 1840,
  "cityId": "valldemossa",
  "instrumentationId": "solo-piano"
}
```
Response:
```json
{
  "correct": {
    "composerId": "chopin-f",
    "composerName": "Frédéric Chopin",
    "workTitle": "Prelude in D-flat major, Op. 28 No. 15",
    "era": "romantic",
    "yearComposed": 1839,
    "cityId": "valldemossa",
    "cityName": "Valldemossa",
    "instrumentationId": "solo-piano"
  },
  "scoreBreakdown": {
    "composer": { "points": 500, "maxPoints": 500, "correct": true },
    "era": { "points": 480, "maxPoints": 500, "correct": true, "yearsOff": 2 },
    "city": { "points": 500, "maxPoints": 500, "correct": true },
    "instrumentation": { "points": 500, "maxPoints": 500, "correct": true }
  },
  "roundScore": 1980,
  "maxRoundScore": 2000,
  "explanation": {
    "summary": "Every piece of evidence points to Chopin in the years around 1838.",
    "points": [
      { "clueId": null, "text": "The manuscript hand — cramped beaming, rightward-slanting stems — matches known Chopin autographs of the late 1830s." },
      { "clueId": "r1c1", "text": "Lenz is describing Chopin's characteristic rubato, in which the left hand keeps strict time against a freely inflected right hand." },
      { "clueId": "r1c2", "text": "The Mallorca winter is when the Op. 28 Preludes were completed, at the Valldemossa charterhouse." }
    ]
  }
}
```
Notes:
- `explanation` is the educational payoff of the round: it is returned on every guess, right or
  wrong, and should be rendered on the reveal screen. Each entry in `points` ties back to a clue
  via `clueId` so the UI can show the reasoning next to the evidence it came from; `clueId` is
  `null` for points about the manuscript image itself.
- `workTitle` is what the excerpt actually is, for the reveal screen.
- `era` describes the composer. `yearComposed` and `cityId` describe **this work**: where and when
  it was written. Chopin's Op. 28 No. 15 scores as Valldemossa, because that is where he wrote it,
  even though he was Polish and lived in Paris.
- `cityName` is included alongside `cityId` so the reveal screen does not have to look it up.
- **Backend owns scoring**, not the frontend. This keeps scoring consistent/tamper-resistant and
  lets scoring rules evolve without a frontend redeploy. Frontend just renders whatever breakdown
  comes back.
- `era` scoring is distance-based (closer guessed year → more points, like GeoGuessr's map
  distance), hence `yearsOff` — useful for the reveal UI to show "off by N years."
- Any field can be omitted from the guess request if we support partial guesses — TBD, default
  assumption is all four fields are required before submit is enabled.

---

## 4. Session summary

### `GET /api/game/{sessionId}/summary`
```json
{
  "sessionId": "sess_abc123",
  "totalScore": 8420,
  "maxScore": 10000,
  "rounds": [
    { "roundId": "r1", "roundScore": 1980, "maxRoundScore": 2000 }
  ]
}
```

---

## 5. Errors

Standard shape for all error responses:
```json
{ "error": "SESSION_NOT_FOUND", "message": "No session with id sess_abc123" }
```
Expected codes: `SESSION_NOT_FOUND`, `ROUND_NOT_FOUND`, `ROUND_ALREADY_GUESSED`, `VALIDATION_ERROR`,
mapped to HTTP 404, 404, 409 and 400 respectively. Frontend should key off the `error` string
rather than the status code.

---

## Resolved

- **Rounds are sent upfront**, images and clues together. No answer data is exposed until guess
  time, so nothing leaks; this also lets the frontend prefetch images so the reveal has no stutter.
- **Sessions are anonymous and in-memory** for now. No accounts, no leaderboards; sessions do not
  survive a backend restart.
- **Excerpt images are pre-cropped offline** and served as static backend assets. No runtime PDF
  rendering. Sources are public-domain (IMSLP).
- **Location is the city where the work was written**, not the composer's region. Regions were
  dropped: every composer in the catalogue is European, so a region guess was close to free.
- **Year scoring is `500 − (10 × yearsOff)`**, floored at 0, matching the worked example above.
  `correct` on that axis means within 5 years. Composer, city and instrumentation are
  all-or-nothing.
- **There is no database.** Content is a folder of JSON files; sessions are in memory.
- **The guess sends a `cityId`, scored as an exact match.** True GeoGuessr scoring — a map pin
  scored by kilometres from the real location — is deferred, not rejected. The cities already
  carry coordinates, so the data is ready if the frontend wants to move to a lat/lon pair later.
  `GET /api/cities` stays either way, since the map needs coordinates to place markers.

## Open questions for backend

- `difficulty` on `/game/start` has no defined effect yet — backend accepts and ignores it.
- Should `/summary` also return each round's correct composer, for an end-of-game recap screen?
  It currently returns scores only.
- Some works resist a single `instrumentationId` (is a piano concerto `solo-piano` or
  `orchestral`?). Backend picks one canonical category per work; flag if the UI needs to accept
  either.
