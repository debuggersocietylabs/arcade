---
name: continue-game
description: Make meaningful progress on an existing game: new features, polish, difficulty tuning, juice. Use when asked to continue/improve a game or when a scheduled "continue development" task runs.
---

# Continue developing a game

1. `npm ci && npm run status`. Choose the target: the game named in the task; otherwise the `wip` game with the most open backlog items, otherwise the playable game with the oldest last-touched date (check `progress/log/`).
2. Read `games/<slug>/NOTES.md` (**Next steps** is your queue) and the matching `[game:<slug>]` backlog items. Read `logic.ts` and `game.ts` before changing anything.
3. Pick **one coherent improvement** (usually the top of Next steps): a feature, a polish pass (sound, particles, camera, UI), a balance pass, or mobile controls. Prefer things a player would notice.
4. Implement rules in `logic.ts` with tests first; rendering after. Don't regress existing tests.
5. Playtest: run the e2e test, take screenshots, and reason about balance (write a small simulation test if useful, e.g. bots that play N seeded runs).
6. If the game now has a complete, fun core loop, flip `status` to `playable` in `game.json`.
7. Update `NOTES.md` (move finished items out of Next steps, add new ideas you discovered), then run **session-wrapup**.
