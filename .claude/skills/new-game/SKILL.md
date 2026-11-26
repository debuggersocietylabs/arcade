---
name: new-game
description: Create a brand-new playable game for the arcade end to end (idea, scaffold, logic with tests, rendering, polish, notes, PR). Use when asked to add/create a new game or when a scheduled "new game" task runs.
---

# Create a new game

1. **Orient**: `npm ci && npm run status`. Read `progress/BACKLOG.md`.
2. **Choose the idea**: prefer open `[idea]` items that have a spec in `progress/ideas/` (build exactly that spec's MVP scope first), then other backlog ideas, favouring variety (genre, 2D vs 3D, session length) relative to existing games. If none fit, invent one and add it to the backlog first. Keep scope small: a complete, fun 2-5 minute loop beats an ambitious unfinished one.
3. **Scaffold**: `npm run new-game -- <slug> --type 2d|3d --title "<Title>"`. Read `.claude/skills/game-dev-guide/SKILL.md`.
4. **Logic first**: write rules in `logic.ts` (pure state + `step(state, dt, ...)` + `dispatch` commands) and cover them in `logic.test.ts` (movement, collisions, scoring, win/lose, determinism per seed, fairness of generated content).
5. **Render**: implement `game.ts` on top of the logic: scene, lights/materials (`emissiveMaterial`), HUD (`hud.setStats`, `hud.showOverlay`), input (`createInput`), game-over + restart, high score (`submitHighScore`). Expose `getState()` and `command()` on the returned instance.
6. **Browser test**: add `games/<slug>/<slug>.e2e.ts` (start the game, perform an input, assert via `window.__arcade.game.getState()`). The generic smoke test already covers boot/no-errors.
7. **Look at it**: build, serve with `npx vite preview`, take a Playwright screenshot of the start screen and mid-play; fix anything ugly or unreadable.
8. **Polish**: fill `game.json` (no TODOs; pick a distinct `color` and `emoji`), set `status` to `playable` only if complete.
9. Write `NOTES.md` (concept, state, next steps, technical notes, known issues).
10. `npm run check`, then run the **session-wrapup** skill (marks the idea done, logs the session, pushes the branch for auto-merge).
