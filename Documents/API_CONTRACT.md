# Musicology Guesser — Frontend ↔ Backend API Contract

This is the frontend's expected contract for the backend (Java). It's a starting point — if
something is awkward to implement server-side, we can adjust field names/shapes together, but the
overall shapes (rounds, reference lists, guess → result) should stay stable since the whole game
loop is built around them.

Base path assumed: `/api`. Format: JSON over HTTPS. No auth assumed yet (add a session/user id
later if accounts are needed).

> **Frontend proposal, pending backend review** — the sections below (§3 guess request/response,
> Resolved, Open questions) have been updated to describe four mechanics just built on the
> frontend: (1) any of the four guess fields can be skipped for a flat honesty bonus, (2) the
> location guess is now a dropped pin (lat/lon) scored by distance rather than a `cityId` pick,
> (3) revealing evidence now costs points, tracked via `cluesRevealed`. None of this is live against
> a real backend yet — it's all served by a frontend mock. Flagging here so whoever picks up the
> Java side isn't surprised by the shape.

---

## 0. Health

### `GET /api/health`
```json
{ "status": "ok", "cases": 6, "activeSessions": 3 }
```
For deployment checks and for sanity during a demo. The app refuses to start if the content
catalogue is broken, so a `200` here already means the cases loaded. `cases` is also the ceiling on
`roundCount`. No answer data is exposed.

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
- `difficulty` is accepted and ignored. Scoring does not change with it.
- `roundCount` is capped at the number of cases in the catalogue. Asking for 20 when 6 exist
  returns 6 rounds rather than an error, so read the length of `rounds` rather than assuming you
  got what you asked for.
- No answer data is included here — the composer is only revealed after a guess is submitted.
  Clue text must never name the composer, and `imageUrl` paths must be opaque (`/media/r1.png`,
  never `/chopin-nocturne-op9.png`).

---

## 3. Submitting a guess

### `POST /api/game/{sessionId}/rounds/{roundId}/guess`
Request:
```json
{
  "composerId": null,
  "guessedYear": 1840,
  "locationGuess": { "type": "pin", "lat": 39.71, "lon": 2.62 },
  "instrumentationId": "solo-piano",
  "cluesRevealed": 1
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
    "composer": { "points": 200, "maxPoints": 500, "correct": false, "skipped": true },
    "era": { "points": 480, "maxPoints": 500, "correct": true, "yearsOff": 2 },
    "location": { "points": 500, "maxPoints": 500, "correct": true, "distanceKm": 0.4 },
    "instrumentation": { "points": 500, "maxPoints": 500, "correct": true }
  },
  "roundScore": 1080,
  "maxRoundScore": 2000,
  "evidencePenalty": 100,
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
- **Any field can be `null` — the player skipped that question rather than guessing blind.** A
  skipped field always scores a flat 200-point honesty bonus (`skipped: true`, `correct: false`),
  which beats a wrong guess (0) but loses to a right one (500). This resolves the old "partial
  guesses — TBD" note: partial guesses are now the norm, not an edge case, since the UI asks the
  four questions one at a time and lets the player skip any of them.
- **`locationGuess` replaces `cityId`.** Instead of picking from `GET /api/cities`, the frontend
  now shows a map and lets the player drop a pin anywhere, like GeoGuessr — `{ "type": "pin", "lat", "lon" }`.
  A player can also explicitly say the work wasn't written anywhere on the pictured map via
  `{ "type": "outside-map" }` (today that's just "outside Europe"). `GET /api/cities` and its
  lat/lon data don't go away — they're exactly what `location` scoring needs: distance in km
  (haversine, or an equirectangular approximation is probably fine given how small the map is)
  between the dropped pin and the correct work's coordinates, decaying like era scoring (full
  credit within a small radius, 0 past some max distance — frontend currently uses a 15/260 unit
  grace/max window in its own local coordinate space as a placeholder, not real km).
  `distanceKm` on the response mirrors `yearsOff` — a number for the reveal UI to show, not used
  for anything else client-side.
- `explanation` is the educational payoff of the round: it is returned on every guess, right or
  wrong, and should be rendered on the reveal screen. Each entry in `points` ties back to a clue
  via `clueId` so the UI can show the reasoning next to the evidence it came from; `clueId` is
  `null` for points about the manuscript image itself.
- `workTitle` is what the excerpt actually is, for the reveal screen.
- `era` describes the composer. `yearComposed` and the correct city describe **this work**: where
  and when it was written. Chopin's Op. 28 No. 15 scores as Valldemossa, because that is where he
  wrote it, even though he was Polish and lived in Paris.
- `cityName` is included alongside `cityId` so the reveal screen does not have to look it up.
- **Backend owns scoring**, not the frontend. This keeps scoring consistent/tamper-resistant and
  lets scoring rules evolve without a frontend redeploy. Frontend just renders whatever breakdown
  comes back.
- `era` scoring is distance-based (closer guessed year → more points, like GeoGuessr's map
  distance), hence `yearsOff` — useful for the reveal UI to show "off by N years."
- **`cluesRevealed` is new**: how many evidence cards the player opened before submitting.
  `evidencePenalty = 100 × cluesRevealed`, subtracted from the sum of the four axes to get
  `roundScore` (floored at 0; `maxRoundScore` is unaffected, so using evidence lowers your actual
  score but not your ceiling). Right now the frontend just counts client-side clicks and reports
  the number — worth discussing whether backend should track clue reveals itself (a
  `POST /rounds/{roundId}/reveal-clue` call per clue) instead of trusting a client-reported count,
  since as written a modified client could just always send `cluesRevealed: 0`.
- `roundScore` is the sum of the four axes minus `evidencePenalty`.

---

## 4. Session summary

### `GET /api/game/{sessionId}/summary`
```json
{
  "sessionId": "sess_abc123",
  "totalScore": 8420,
  "maxScore": 10000,
  "rounds": [
    {
      "roundId": "r1",
      "roundScore": 1980,
      "maxRoundScore": 2000,
      "caseNumber": 17,
      "composerName": "Frédéric Chopin",
      "workTitle": "Prelude in D-flat major, Op. 28 No. 15"
    }
  ]
}
```
Notes:
- `caseNumber`, `composerName` and `workTitle` are there so the end screen can recap what each
  round actually was without re-fetching anything. They are safe to send because `rounds` only ever
  contains rounds that have already been guessed, and the guess response already revealed them.
- `rounds` lists **guessed rounds only**, so it can be shorter than the session. `maxScore` still
  counts every round in the session, so abandoning a game shows as a shortfall rather than a
  perfect score on one round.

---

## 5. Errors

Standard shape for all error responses:
```json
{ "error": "SESSION_NOT_FOUND", "message": "No session with id sess_abc123" }
```
Every error the backend can produce uses this shape, including ones Spring raises itself. Frontend
should key off the `error` string rather than the status code.

- `SESSION_NOT_FOUND` — 404. Also what an expired session returns; sessions are evicted after a
  period of inactivity, so a game left open overnight comes back as if it never existed.
- `ROUND_NOT_FOUND` — 404.
- `ROUND_ALREADY_GUESSED` — 409. Rounds take exactly one guess.
- `VALIDATION_ERROR` — 400. Missing or malformed fields, unparseable JSON, and ids that are
  well-formed but not in the catalogue (an unknown `cityId`).
- `NOT_FOUND` — 404. A URL that matches no endpoint or static file. Distinct from the two specific
  404s above so a typo in a path is not mistaken for a missing session.
- `INTERNAL_ERROR` — 500. Genuinely unexpected; the detail is logged server-side and the client
  gets an opaque message rather than a stack trace.

`message` is for developers, not end users. Do not render it in the UI.

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
- **`/summary` returns each round's composer and work title**, alongside the scores, for the
  end-of-game recap. Additive: the original three fields are unchanged.
- **The location guess is now a dropped pin, not a `cityId` pick.** This is the "deferred, not
  rejected" GeoGuessr-style scoring called out in the previous revision of this doc — the frontend
  has moved to it. `GET /api/cities` still stands as the source of truth for each case's correct
  coordinates; only the guess request's shape changed.
- **Any of the four guess fields can be skipped (`null`) for a flat 200-point honesty bonus.**
  Resolves the old "partial guesses — TBD" question: partial guesses are the expected path now,
  not an exception, since the UI asks instrumentation, era, composer, and location one at a time
  and lets the player skip any of them.
- **Revealing evidence costs points.** 100 points per clue, deducted from `roundScore` (not
  `maxRoundScore`) as `evidencePenalty`.
- **The question order is instrumentation → era → composer → location, one at a time.** This is a
  frontend-only sequencing choice and doesn't change the request shape — it's still one POST with
  all four fields (or nulls) once the player finishes or skips through all four.

## Open questions for backend

- `difficulty` on `/game/start` is accepted and ignored.
- Some works resist a single `instrumentationId` (is a piano concerto `solo-piano` or
  `orchestral`?). Backend picks one canonical category per work; flag if the UI needs to accept
  either.
- Should `evidencePenalty` be backend-computed from a trusted server-side count (e.g. a
  `POST /rounds/{roundId}/reveal-clue` call per clue) instead of the client-reported
  `cluesRevealed` in the guess request? As specified, a modified client could under-report it.
- For pin-drop distance scoring: haversine (real great-circle km) or a flat equirectangular
  approximation? Given the map only covers Europe, the approximation error is probably small
  enough not to matter, but worth a decision either way.
- The frontend's current map is a simplified schematic (rough country shapes, not real borders),
  and today it scores purely in its own local pixel coordinate space — it does **not** yet convert
  clicks to real lat/lon, so the request/response shapes above (`lat`/`lon`, `distanceKm`) describe
  the target shape, not what's wired up yet. Converting pixel position to an approximate lat/lon
  (or switching to a real geo-projected map image) is the next step before this can talk to a real
  backend using `GET /api/cities`' coordinates.
