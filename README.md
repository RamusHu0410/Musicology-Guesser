# Musicology-Guesser
Guess the composer given part of the music piece

Learn the story behind the score in https://musicology-guesser.vercel.app/
(If the app is struggle to load, please move to https://musicology-guesser.onrender.com/ to activate the backend)

# 3 Core Features
- Field Guide
<img width="545" height="378" alt="image" src="https://github.com/user-attachments/assets/7e6160d9-1930-4a41-9b5c-8e3123e98c07" />

Quick, fun hints on instrumentation, era, composer, and region — built for beginners who want a nudge, not a lecture.
Read over this to found the correct solution

- Run the Guesser
<img width="1006" height="747" alt="image" src="https://github.com/user-attachments/assets/907e3036-0bc8-4660-b098-f2f67ff8ec35" />
You'll see a short excerpt of manuscript and a case file of evidence. Decide the instrumentation, era, composer, and region — skip anything you're unsure of for a modest, honest 100 points.

- Collection
<img width="776" height="647" alt="image" src="https://github.com/user-attachments/assets/77cbf016-9fd5-4247-a385-0def5034e9a8" />

A collection of composers based on the mastery gained

## Tech stack

| | |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind, Zustand, React Router |
| Backend | Java 21, Spring Boot 3.5 |
| Content | JSON cases + PNG manuscripts. No database. Sessions stay in memory. |
| Hosting | Frontend on [Vercel](https://musicology-guesser.vercel.app/). Backend on [Render](https://musicology-guesser.onrender.com/). |

Contract: [`Documents/API_CONTRACT.md`](Documents/API_CONTRACT.md). Backend notes: [`Backend/README.md`](Backend/README.md).

## How a round is scored

Four axes, **500** each, **2000** per round.

- Composer, country (where the work was written), and instrumentation: exact match, 500 or 0.
- Year: `500 − 10 × years off`, floored at 0.
- Skip a question: **100** honesty points (client).
- Each clue: **−20** (client).

Answers are not sent to the browser until you guess. Clue text never names the composer, the work, or the answer country.

## Run it locally

Need **JDK 21** and **Node 20+**. Nothing else.

```bash
# terminal 1 — API on http://localhost:8080
cd Backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home   # macOS Homebrew JDK 21
./mvnw spring-boot:run

# terminal 2 — app on http://localhost:5173
cd Frontend
npm install
npm run dev
```

Restart the backend after changing cases, then start a **new** game.

```bash
cd Backend && ./mvnw test
cd Frontend && npm test
```

## API

| Method | Path |
| --- | --- |
| `GET` | `/api/health` |
| `GET` | `/api/composers` |
| `GET` | `/api/countries` |
| `GET` | `/api/instrumentation-categories` |
| `POST` | `/api/game/start` |
| `POST` | `/api/game/{sessionId}/rounds/{roundId}/guess` |
| `GET` | `/api/game/{sessionId}/summary` |
| `GET` | `/media/{file}` |

## Team

| | |
| --- | --- |
| **Sanay Kothalkar** | Java / Spring Boot, case catalogue, scoring, manuscripts |
| **Ramus Hu** | TypeScript / React, Play UI, Field Guide, Collection, deploy |

Manuscripts are cropped from public-domain sources (typically IMSLP).
