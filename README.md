# LEONIDA LEDGER — GTA VI trophy guide & tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/0xvand/leonida-ledger-2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/0xvand/leonida-ledger-2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze — with a cited unlock guide for every single trophy, a six-phase roadmap to the platinum, and the game's one missable trophy flagged everywhere it matters.

## What's inside

- **The full tracker.** Every trophy with its official name, description and grade, exactly as PlayStation publishes them. Tick trophies off as you earn them; progress saves in your browser (localStorage) and survives reloads. The header keeps a live progress ring, earned count, per-grade tallies and your PSN points (platinum 300 / gold 90 / silver 30 / bronze 15 — 1,350 across the list).
- **Filters that match how you play.** Search by name or description, filter by kind (story, missable, collectibles, activities, feats & fortune), filter by grade, or hide everything you've already earned.
- **Spoiler shield.** Turn it on and unearned story trophies show as "Hidden story trophy" — no names, no descriptions — until you earn them or choose to reveal one individually.
- **Export / import.** Download your progress as a small JSON file and import it on another browser or machine.
- **A guide on every card.** Each trophy expands to an original guide paragraph plus 3–4 concrete, ordered unlock steps, a difficulty rating (1–10) and a time estimate.
- **Roadmap to Platinum.** Six phases — story first, the missable moment, the collectible sweep, activities, feats & fortune cleanup, and the platinum itself — each with tactics and a per-phase checklist of its trophies. All 55 trophies appear in exactly one phase.
- **Missables page.** Exactly **one** trophy in GTA VI can be lost: **Positive Mental Attitude**. One of the 18 meditation spots is offered during Chapter 1 at Jason's house and cannot be revisited the same way afterwards, and GTA VI has no mission replay. The page explains the moment, the Chapter 1 rule, and why the other 54 trophies are safe in free roam.

## How the citations work

**188 steps, and every one of them names its source.** Each step in each guide carries a citation chip naming the guide it draws on, and each card ends with its full source list, linked. The Sources & Citations tab collects all ten dated sources — PowerPyx, Push Square, Exophase, PSNProfiles, TrueTrophies, Game8, IGN, Eurogamer, Rockstar's Newswire and the PlayStation Blog, all dated November 2026 — with a note on what each one backs. Where sources disagree (a count, a location, an estimate), the step follows the specialist trophy guides and says so. No step is presented as sourced when it isn't.

## Run it

The app is fully static and works offline — no build step, no network calls at runtime.

```sh
node serve.ts            # then open http://localhost:8080
```

or serve the `app/` folder with any static file server. `main.ts` is the hand-in program for the bounty: it copies `app/` and `screenshots/` into the output directory and builds `dossier.json` with the kit's dossier builder.

### Deep links

The URL hash drives the app, which is also how the screenshots in `screenshots/` were taken:

- `#open=28` — tracker with that trophy's guide open
- `#earn=2,3,8,16,21` — seed a run already under way
- `#view=roadmap` / `#view=missables` / `#view=sources` — open a specific tab
- `#shield=1` — start with the spoiler shield on

## Screenshots

1. `1-checklist.jpg` — the tracker with a run under way (5 of 55 earned)
2. `2-missable-guide.jpg` — Positive Mental Attitude's guide open: missable warning, 4 cited steps, source list
3. `3-roadmap.jpg` — the six-phase Roadmap to Platinum
4. `4-missables.jpg` — the one-missable warning page

---

*LEONIDA LEDGER is a fan-made companion. Trophy names, descriptions and grades are shown exactly as PlayStation publishes them; every guide and step here is written for this app and cites its source beside the text. Not affiliated with Rockstar Games or Take-Two Interactive.*
