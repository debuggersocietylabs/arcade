---
name: daily-new-game
description: Invent AND build AND publish one brand-new original game in a single session, with a trending or pop-culture hook. Use for the daily "new game" scheduled task.
---

# Daily new game: idea → build → publish

**The deliverable is a new, complete, playable game live on the site by the end of this session.** An idea or spec alone is a failed session.

## 1. Ideate (keep it short: about 15% of the session)
Follow `ideate-game` steps 1-5 (check what exists, research what is trending now, brainstorm at least 8 concepts, pick one original winner, write the spec to `progress/ideas/`). Pick for **buildability today**: one core mechanic that is fun within 10 seconds, explainable in one sentence, procedural art only. Then continue immediately; do not stop after the spec.

Never repeat or lightly reskin an existing game. Vary genre, 2D/3D and mechanic compared with the last 5 games.

## 2. Build
Follow `new-game` steps 3-9 and `game-dev-guide`, using your spec's MVP scope. Required for publishing:
- start screen with instructions, clear goal, fail/win state, restart, score, persisted high score, difficulty ramp;
- **keyboard AND touch** controls that are both enough to play the whole game; fits desktop and a 390×844 phone;
- logic unit tests and a `<slug>.e2e.ts` that plays it;
- juice: particles or screen shake, WebAudio sound effects (start audio only after a user input), a distinct visual identity.

## 3. Playtest honestly
Screenshot the start screen, mid-game and game-over at 1280×720 and 390×844, and Read the images. Drive scripted inputs over several seeds. Ask: is it obvious what to do, is it fun, is it fair? Fix what is not before publishing.

## 4. If time or difficulty runs short
Cut features, not quality: ship a smaller game that is complete. Use `status: "wip"` only if it is playable but clearly unfinished, and list what is missing in its NOTES.md. **Never publish a game that is broken or cannot be played**; and never weaken or delete tests to get through CI. If nothing publishable is possible, deliver just the spec and say so clearly in the log.

## 5. Publish and record
`npm run check` must pass. Mark the idea done in `progress/BACKLOG.md`, put worthwhile runner-ups there as `[idea]` lines, add the game to the table in `README.md`, then run `session-wrapup` (branch `claude/new-game-<slug>-<date>`, commit prefix `[new-game] <Title>`). Pushing the branch publishes the game once CI passes.

## Limits
Only add your own `games/<slug>/` folder plus progress/README updates. Avoid changing `src/shared/`; if you must, make it additive and keep every existing game working. Do not work on Harbor City (it has its own daily session).
