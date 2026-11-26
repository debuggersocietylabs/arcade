# Setup: GitHub Pages and scheduled Claude tasks

## 1. Publish with GitHub Pages

The site is a Vite build, so something must run `npm run build` and publish `dist/`. `.github/workflows/deploy.yml` does that on **every push to `main`** (after tests pass).

1. Push this repo to `main` on `debuggersocietylabs/arcade`.
2. Repo → **Settings → Pages → Build and deployment → Source: _GitHub Actions_** (not "Deploy from a branch": Pages cannot build Vite/TypeScript from a branch, and the root of `main` is source code, not the built site).
3. Open the **Actions** tab, watch "Deploy to GitHub Pages" finish. Site: `https://debuggersocietylabs.github.io/arcade/`.

Notes:
- Changing Pages settings needs **admin** rights. As a collaborator with write access you may need an owner to flip the setting (or grant you admin).
- Pages on a *private* repo requires a paid GitHub plan; public repos are free.
- If the org restricts the `github-pages` environment to certain branches, allow `main`.
- Optional: Settings → Branches → protect `main`, require the **CI / verify** check, so nothing broken can merge.

## 2. Recurring Claude Code cloud tasks (routines)

Create these at **claude.ai/code → Routines** (or run `/schedule` inside Claude Code). Details of the UI may change, but each routine needs: a **prompt**, the **repository** `debuggersocietylabs/arcade` (install the Claude GitHub app on it first), and a **schedule**.

All sessions begin with no memory; `CLAUDE.md`, `.claude/skills/` and `progress/` give them everything. Keep the prompts short and point at the skills:

| Routine | Suggested schedule | Prompt |
| --- | --- | --- |
| **New game** | weekly | `Use the new-game skill to create one new, complete, playable game for the arcade. Follow CLAUDE.md. Finish with the session-wrapup skill and open a PR.` |
| **Continue development** | every 1-2 days | `Use the continue-game skill to make one meaningful improvement to an existing game (choose via npm run status). Follow CLAUDE.md. Finish with session-wrapup and open a PR.` |
| **Bug hunt** | daily | `Use the fix-bugs skill: run all checks, playtest every game with scripted input, fix confirmed bugs test-first. Follow CLAUDE.md. Finish with session-wrapup and open a PR.` |

Environment requirements for the routine's cloud environment:
- Network access to the npm registry (for `npm ci`) and to Playwright's browser download (`npx playwright install --with-deps chromium`). Put those in the environment's setup script if available, e.g. `npm ci && npx playwright install --with-deps chromium`.

### How changes land
- **Default (recommended):** routines push `claude/...` branches and open **PRs**; CI runs; you merge. Merging to `main` triggers the deploy.
- **Hands-off:** enable *Settings → General → Allow auto-merge* plus branch protection requiring the CI check, and let sessions run `gh pr merge --auto --squash`; or grant the routine permission to push directly to `main` (deploy.yml still blocks publishing on failing tests, but a bad commit would sit on `main`). Start with PRs; loosen once you trust the output.

### Persistent progress
`progress/BACKLOG.md` (queue), `progress/log/` (one file per session), `games/*/NOTES.md` (per-game state). Edit the backlog yourself any time to steer the agents: add an `[idea]`, a `[bug]`, or reprioritise.

## 3. Local development
Node 20+ (CI uses 22). `npm ci`, `npm run dev`, `npm run check`. First e2e run needs `npx playwright install chromium`.
