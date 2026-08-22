# Musicology Guesser — Frontend ↔ Backend API Contract

This is the frontend's expected contract for the backend (Java). It's a starting point — if
something is awkward to implement server-side, we can adjust field names/shapes together, but the
overall shapes (rounds, reference lists, guess → result) should stay stable since the whole game
loop is built around them.

Base path assumed: `/api`. Format: JSON over HTTPS. No auth assumed yet (add a session/user id
later if accounts are needed).

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
which belongs to the case rather than the composer — see `GET /api/countries` below.

### `GET /api/countries`
The countries a work could have been written in, used to power the location guess. Replaces the
earlier `GET /api/cities` (and before that `/api/regions`).

```json
[
  { "id": "austria", "name": "Austria", "lat": 48.2082, "lon": 16.3738 },
  { "id": "spain", "name": "Spain", "lat": 40.4168, "lon": -3.7038 }
]
```

Coordinates are the conventional capital, so the list can be rendered on a map. Scoring is exact
match on `countryId`.

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
  "composerId": "chopin-f",
  "guessedYear": 1840,
  "countryId": "spain",
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
    "countryId": "spain",
    "countryName": "Spain",
    "instrumentationId": "solo-piano"
  },
  "scoreBreakdown": {
    "composer": { "points": 500, "maxPoints": 500, "correct": true },
    "era": { "points": 480, "maxPoints": 500, "correct": true, "yearsOff": 2 },
    "country": { "points": 500, "maxPoints": 500, "correct": true },
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
- `era` describes the composer. `yearComposed` and `countryId` describe **this work**: where and when
  it was written. Chopin's Op. 28 No. 15 scores as Spain, because that is where he wrote it,
  even though he was Polish and lived in France.
- `countryName` is included alongside `countryId` so the reveal screen does not have to look it up.
- **Backend owns scoring**, not the frontend. This keeps scoring consistent/tamper-resistant and
  lets scoring rules evolve without a frontend redeploy. Frontend just renders whatever breakdown
  comes back.
- `era` scoring is distance-based (closer guessed year → more points, like GeoGuessr's map
  distance), hence `yearsOff` — useful for the reveal UI to show "off by N years."
- `roundScore` is the sum of the four axes. Opening clues does not change the score.
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
  well-formed but not in the catalogue (an unknown `countryId`).
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
- **Location is the country where the work was written**, not the composer's nationality. Chopin's
  Mallorca prelude scores as Spain. Cities and regions were dropped as the guess unit.
- **Year scoring is `500 − (10 × yearsOff)`**, floored at 0, matching the worked example above.
  `correct` on that axis means within 5 years. Composer, country and instrumentation are
  all-or-nothing.
- **There is no database.** Content is a folder of JSON files; sessions are in memory.
- **`/summary` returns each round's composer and work title**, alongside the scores, for the
  end-of-game recap. Additive: the original three fields are unchanged.
- **The guess sends a `countryId`, scored as an exact match.** Countries carry capital coordinates
  so a map can still place markers.

## Open questions for backend

- `difficulty` on `/game/start` is accepted and ignored.
- Some works resist a single `instrumentationId` (is a piano concerto `solo-piano` or
  `orchestral`?). Backend picks one canonical category per work; flag if the UI needs to accept
  either.
