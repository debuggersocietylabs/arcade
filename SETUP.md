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

| Routine | Schedule (Cairo) | What it does |
| --- | --- | --- |
| **Arcade: Harbor City daily** | daily 03:00 | `harbor-city-daily`: assess, then add depth (new features/systems), upgrade graphics, fix the worst problem |
| **Arcade: daily new game** | daily 09:00 | `daily-new-game`: research trends, invent an original game, build it and publish it |

Both exist at claude.ai/code/routines; edit prompts and schedules there. Optional extra: a **Bug hunt** routine (`Use the fix-bugs skill…`).

Tips:
- Keep the schedules apart: both touch `progress/BACKLOG.md`, so overlapping runs can conflict and leave a branch unmerged.
- Both need the Playwright browser for screenshots (see below); the new-game routine also needs web access for trend research.
- CI runs browser tests for every game, so it slows down as games pile up. The CI job has a 15-minute timeout: check its duration now and then.

Environment requirements for the routine's cloud environment:
- Network access to the npm registry (for `npm ci`) and to Playwright's browser download (`npx playwright install --with-deps chromium`). Put those in the environment's setup script if available, e.g. `npm ci && npx playwright install --with-deps chromium`.

### How changes land (auto-merge, no PRs)
Routines commit to a `claude/...` branch and push it. `.github/workflows/auto-merge.yml` then runs typecheck, unit tests, build and e2e; if they pass it rebases the branch onto `main`, fast-forwards `main`, deletes the branch and dispatches `deploy.yml` (pushes made with `GITHUB_TOKEN` don't trigger other workflows, hence the dispatch). A failing branch is simply left unmerged (check the Actions tab / leftover `claude/*` branches). A rebase conflict (e.g. two routines editing `BACKLOG.md`) also leaves the branch unmerged.
No admin settings are needed. If you later want human review instead, delete `auto-merge.yml` and tell the routines to open PRs.

### Persistent progress
`progress/BACKLOG.md` (queue), `progress/log/` (one file per session), `games/*/NOTES.md` (per-game state). Edit the backlog yourself any time to steer the agents: add an `[idea]`, a `[bug]`, or reprioritise.

## 3. Local development
Node 20+ (CI uses 22). `npm ci`, `npm run dev`, `npm run check`. First e2e run needs `npx playwright install chromium`.
