# GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nonicon/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nonicon/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An unofficial, offline guide and tracker for all **55 PlayStation 5 trophies** of
*Grand Theft Auto VI* (1 platinum, 2 gold, 6 silver, 46 bronze), built for the
[make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Checklist of all 55 trophies** with the official name, description and grade
  exactly as PlayStation publishes them, plus a guide in our own words for every
  trophy — what to do, where and how, and when it can be missed — with its sources
  named beside it.
- **Progress saved in your browser** (localStorage), with **export to a file** and
  **import back**.
- **Filters** by kind (story, missable, collectibles, activities, online), by grade,
  by missable-only / un-earned-only, plus a search box.
- **Spoiler mode** hides the names and descriptions of un-earned story trophies
  until you earn them.
- **Roadmap to the platinum** in 5 stages, built from the official descriptions:
  story chapters and missions, collectibles with their counts, and the 100%
  completion checklist. About 200 hours, difficulty 4/10 (PowerPyx).
- **Missable flags**: only one trophy is flagged as potentially missable —
  *Positive Mental Attitude* (meditate at all 18 spots; the Chapter 1 spot can
  disappear after that chapter, and there is no mission replay).
- **Guide panel**: click any trophy to read its guide and sources beside the list.

## How to run

```sh
node serve.ts
```

Then open http://localhost:8080. The app is plain static files under `app/` with
no build step, and it works with the network off — it loads nothing from outside
`app/` and makes no network requests at run time.

Deterministic views for screenshots: `?filter=<kind|grade>`, `?spoiler=1`,
`?open=<trophy id>`, `?demo=1` (checks a handful of trophies so progress shows).

## Sources

- Trophy names, descriptions and grades: the official list as published by
  Exophase and PSNProfiles (18 Nov 2026), cross-checked by Planet GTA 6.
- Roadmap, difficulty, time and missable: PowerPyx — GTA 6 Trophy Guide & Roadmap.
- Setting and characters: Rockstar Games' official GTA VI site (Leonida, Vice City,
  Lucia Caminos, Jason Duval).

This is an unofficial fan guide, not affiliated with Rockstar Games. It uses no
Rockstar logo, artwork, box art or game screenshots.

## Handing in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

---

Built for [make.fun](https://make.fun/bounty/gta6-trophy-guide-01?ref=nj0kv9v2) — gta6-trophy-guide-01.
