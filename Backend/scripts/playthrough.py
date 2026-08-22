#!/usr/bin/env python3
"""Play a full game against a running backend and check it behaves.

The test suite covers the same ground in-process; this exists to prove the deployed thing works
over real HTTP before a demo, against whatever host and content the server actually has.

    python3 scripts/playthrough.py
    python3 scripts/playthrough.py --base-url https://api.example.org --rounds 3

Exits non-zero on the first failure. Standard library only, so there is nothing to install.
"""

import argparse
import json
import sys
import urllib.error
import urllib.request

PASS = "  ok  "
FAIL = " FAIL "


class CheckFailed(Exception):
    pass


def request(base_url, path, payload=None):
    url = base_url.rstrip("/") + path
    data = json.dumps(payload).encode() if payload is not None else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as err:
        body = err.read().decode(errors="replace")
        raise CheckFailed(f"{path} returned HTTP {err.code}: {body}") from err
    except urllib.error.URLError as err:
        raise CheckFailed(f"could not reach {url}: {err.reason}") from err


def check(description, condition, detail=""):
    if condition:
        print(f"[{PASS}] {description}")
        return
    raise CheckFailed(f"{description}{': ' + detail if detail else ''}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:8080")
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--difficulty", default="normal")
    args = parser.parse_args()

    health = request(args.base_url, "/api/health")
    check("health reports ok", health.get("status") == "ok", json.dumps(health))
    check("catalogue is loaded", health.get("cases", 0) > 0, "no cases")

    composers = request(args.base_url, "/api/composers")
    countries = request(args.base_url, "/api/countries")
    instrumentation = request(args.base_url, "/api/instrumentation-categories")
    check("reference data is present", all([composers, countries, instrumentation]))

    game = request(
        args.base_url,
        "/api/game/start",
        {"roundCount": args.rounds, "difficulty": args.difficulty},
    )
    rounds = game["rounds"]
    check("a session was created", game["sessionId"].startswith("sess_"))
    check(
        "rounds are capped at the catalogue size",
        0 < len(rounds) <= min(args.rounds, health["cases"]),
        f"asked {args.rounds}, got {len(rounds)}",
    )

    start_payload = json.dumps(game)
    leaked = [c["name"] for c in composers if c["name"] in start_payload]
    leaked += [c["name"] for c in countries if c["name"] in start_payload]
    check("no composer or country is named before a guess", not leaked, ", ".join(leaked))
    check(
        "every round ships its clues and an image",
        all(r["clues"] and r["imageUrl"] for r in rounds),
    )

    guess = {
        "composerId": composers[0]["id"],
        "guessedYear": 1800,
        "countryId": countries[0]["id"],
        "instrumentationId": instrumentation[0]["id"],
    }

    expected_total = 0
    revealed = []
    for round_ in rounds:
        result = request(
            args.base_url,
            f"/api/game/{game['sessionId']}/rounds/{round_['roundId']}/guess",
            guess,
        )
        revealed.append(result["correct"])
        expected_total += result["roundScore"]

        breakdown = result["scoreBreakdown"]
        axes = sum(breakdown[axis]["points"] for axis in ("composer", "era", "country", "instrumentation"))
        check(
            f"round {round_['roundId']} scores as the sum of its axes",
            result["roundScore"] == axes,
            f"{axes} != {result['roundScore']}",
        )
        check(
            f"round {round_['roundId']} explains itself",
            bool(result["explanation"]["summary"]) and bool(result["explanation"]["points"]),
        )

    check(
        "the answers really were absent from the start payload",
        not [a["workTitle"] for a in revealed if a["workTitle"] in start_payload],
    )

    repeat = None
    try:
        request(
            args.base_url,
            f"/api/game/{game['sessionId']}/rounds/{rounds[0]['roundId']}/guess",
            guess,
        )
    except CheckFailed as err:
        repeat = str(err)
    check("a second guess on the same round is refused", repeat is not None and "409" in repeat, repeat or "accepted")

    summary = request(args.base_url, f"/api/game/{game['sessionId']}/summary")
    check("summary totals match the rounds", summary["totalScore"] == expected_total)
    check("summary covers every round", len(summary["rounds"]) == len(rounds))
    check(
        "summary recaps each answer",
        all(r.get("composerName") and r.get("workTitle") for r in summary["rounds"]),
    )

    print(
        f"\nPlayed {len(rounds)} rounds on {args.difficulty}: "
        f"{summary['totalScore']} / {summary['maxScore']}"
    )
    for round_, answer in zip(summary["rounds"], revealed):
        print(
            f"  case {round_['caseNumber']:>3}  {round_['roundScore']:>5} pts  "
            f"{answer['composerName']} - {answer['workTitle']}"
        )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except CheckFailed as failure:
        print(f"[{FAIL}] {failure}", file=sys.stderr)
        sys.exit(1)
