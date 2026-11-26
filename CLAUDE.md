# Arcade: instructions for Claude Code

A browser-game arcade published on GitHub Pages. **Babylon.js + TypeScript + Vite.** Many small, polished 2D/3D games under one site.
Most work here is done by **autonomous scheduled sessions with no memory of earlier sessions**. The repo is the memory: follow the protocol below.

## Commands
| Command | Purpose |
| --- | --- |
| `npm ci` | Install (first thing in a fresh checkout) |
| `npm run status` | One-screen summary: games, open backlog, recent sessions. **Run first.** |
| `npm run dev` | Dev server (http://localhost:5173, games at `/games/<slug>/`) |
| `npm run new-game -- <slug> --type 2d\|3d --title "Title"` | Scaffold a game from `templates/` |
| `npm run typecheck` / `npm test` | tsc / Vitest unit tests |
| `npm run test:e2e` | Builds, then Playwright smoke + gameplay tests against the production build |
| `npm run check` | Everything above. **Must pass before you commit.** |

If Playwright's browser is missing: `npx playwright install --with-deps chromium`. If it truly cannot be installed, say so in the PR and the session log; still run typecheck, unit tests and build.

## Layout
- `index.html`, `src/arcade/`: landing page; auto-lists every `games/*/game.json`. Never edit it to add a game.
- `games/<slug>/`: one folder per game: `index.html`, `main.ts`, `game.ts` (rendering/input), `logic.ts` (pure rules), `logic.test.ts`, `game.json`, `NOTES.md`, optional `*.e2e.ts`.
- `src/shared/`: engine/scene helpers, HUD, input (keyboard+swipe), storage (high scores), seeded RNG, `mountGame` shell. Import via `@shared/...`.
- `templates/2d`, `templates/3d`: scaffolds. `progress/`: persistent memory. `.claude/skills/`: workflows.
- Vite auto-discovers `games/*/index.html` (folders starting with `_` are ignored). The site uses `base: './'` (relative URLs) so it works under `/<repo>/`.

## Session protocol (every autonomous session)
1. `npm ci && npm run status`. Read `progress/BACKLOG.md` and the `NOTES.md` of any game you will touch.
2. Pick **one** focused task (see skills: `new-game`, `continue-game`, `fix-bugs`). Don't sprawl.
3. Work on a branch `claude/<kind>-<slug>-<date>` (e.g. `claude/new-game-orbit-defender-2026-12-01`).
4. `npm run check` must be green. Look at the game in the browser (Playwright screenshot) at least once for visual work.
5. Run the `session-wrapup` skill: update the game's `NOTES.md`, `progress/BACKLOG.md`, add `progress/log/<date>-<slug>.md`.
6. Commit with a clear message and push the branch: **GitHub Action `auto-merge.yml` verifies it, merges it into `main` and deploys**. No PR needed (open one only if your task says so). If checks fail on the branch, fix and push again.

## Rules
- **Never leave `main` broken.** Deploys run on every push to `main` and are gated by CI.
- Keep game rules in `logic.ts` (pure: no Babylon, no DOM; enforced by a test) with unit tests. `game.ts` renders and forwards input.
- Use `Rng` from `@shared/rng` (seedable) instead of `Math.random()` in logic. Support `?seed=N` when randomness matters for tests.
- **No external assets**: no downloaded images/models/sounds/fonts, no CDN hotlinks (licensing + offline). Use procedural meshes, emissive materials, WebAudio synthesis, emoji/CSS.
- Every game must work with keyboard **and** touch (swipe/tap via `createInput`), and fit any viewport. (Exception while `wip`: Harbor City is keyboard-only until its touch overlay ships; that is its top roadmap item.)
- A game has: start screen, clear goal, fail/win state, restart, score, persisted high score (`submitHighScore`), tuned difficulty ramp.
- `status: "playable"` only if the core loop is complete and fun; otherwise `"wip"` (still deployed, shown with a WIP badge).
- **Originality**: inspiration from trends and genres is welcome; never use trademarked names, characters, logos, music or copied assets. Family-friendly content only (no gore/violence).
- Don't add dependencies unless clearly needed. Don't edit `.github/workflows/` or `src/shared/` APIs in a way that breaks existing games; if you change a shared API, update every game and run all tests.
- Don't touch other games except for bug fixes. Don't rewrite or delete progress logs from earlier sessions.
- Never commit secrets or `.env` files. Never force-push. Don't push to `main` directly (the auto-merge workflow does it after CI). Never edit `.github/workflows/`.
- Keep the Babylon bundle lean: deep imports (`@babylonjs/core/Meshes/meshBuilder`). If you see "X needs to be imported before as it contains a side-effect", add that import to `src/shared/engine.ts`.

## Skills
`harbor-city-daily` (daily assess + improve the flagship open-world game) · `ideate-game` (invent a trend-aware game idea + spec, no code) · `new-game` · `continue-game` · `fix-bugs` · `session-wrapup` · `game-dev-guide` (Babylon/2D/3D patterns and gotchas).

## Flagship and idea pipeline
- `games/harbor-city` is the flagship: an original open-world city sandbox improved daily. Its vision/roadmap lives in its `NOTES.md`.
- Ideas flow: `ideate-game` → `progress/ideas/<date>-<slug>.md` + `[idea]` in the backlog → `new-game` builds it.
