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
  { "id": "bach-js", "name": "Johann Sebastian Bach", "era": "baroque", "regionId": "central-europe" },
  { "id": "chopin-f", "name": "Frédéric Chopin", "era": "romantic", "regionId": "eastern-europe" }
]
```

### `GET /api/regions`
```json
[
  { "id": "central-europe", "name": "Central Europe" },
  { "id": "eastern-europe", "name": "Eastern Europe" }
]
```

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
    { "roundId": "r1", "imageUrl": "https://.../excerpts/r1.png" },
    { "roundId": "r2", "imageUrl": "https://.../excerpts/r2.png" }
  ]
}
```
Notes:
- `imageUrl` points to an already-cropped PNG/JPG of the sheet music excerpt (backend owns
  cropping/rendering from the source PDF — frontend just displays an image).
- No answer data should be included here — only reveal it after a guess is submitted.

---

## 3. Submitting a guess

### `POST /api/game/{sessionId}/rounds/{roundId}/guess`
Request:
```json
{
  "composerId": "chopin-f",
  "guessedYear": 1840,
  "regionId": "eastern-europe",
  "instrumentationId": "solo-piano"
}
```
Response:
```json
{
  "correct": {
    "composerId": "chopin-f",
    "composerName": "Frédéric Chopin",
    "era": "romantic",
    "yearComposed": 1838,
    "regionId": "eastern-europe",
    "instrumentationId": "solo-piano"
  },
  "scoreBreakdown": {
    "composer": { "points": 500, "maxPoints": 500, "correct": true },
    "era": { "points": 480, "maxPoints": 500, "correct": true, "yearsOff": 2 },
    "region": { "points": 500, "maxPoints": 500, "correct": true },
    "instrumentation": { "points": 500, "maxPoints": 500, "correct": true }
  },
  "roundScore": 1980,
  "maxRoundScore": 2000
}
```
Notes:
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
Expected codes: `SESSION_NOT_FOUND`, `ROUND_NOT_FOUND`, `ROUND_ALREADY_GUESSED`, `VALIDATION_ERROR`.

---

## Open questions for backend

- Do rounds need to be fetched lazily one at a time instead of all upfront (e.g. to avoid leaking
  future answers or to randomize per-request)? Current contract sends all round image URLs at
  `/game/start`, since no answer data is exposed until guess time — should be safe either way, but
  lazy fetch is easy to switch to if preferred.
- Is a persistent session/user id needed for leaderboards, or is this anonymous/single-play only
  for now?
- Where do source PDFs live and does cropping happen at upload time or on-demand per round?
