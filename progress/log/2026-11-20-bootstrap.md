# 2026-11-20 · Bootstrap: arcade shell + Neon Runner

**Type:** new-game / infra · **Games touched:** neon-runner

## What was done
- Created the Vite multi-page arcade (landing page auto-lists `games/*/game.json`).
- Shared library in `src/shared/` (engine, hud, input, storage, rng, mount shell).
- First game: Neon Runner (3D). Templates for 2D/3D games and `npm run new-game`.
- CI (typecheck, unit tests, build, Playwright smoke) and GitHub Pages deploy workflow.
- CLAUDE.md and skills for autonomous sessions.

## State left behind
- All checks green locally (`npm run check`).

## Suggested next session
- Pick an item from `progress/BACKLOG.md`: a new 2D game would diversify the arcade (Orbit Defender).
