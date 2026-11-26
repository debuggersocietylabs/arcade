---
name: fix-bugs
description: Find and fix defects across the arcade (failing tests, console errors, broken games, logged bugs). Use when asked to fix bugs, triage issues, or when a scheduled "bug hunt" task runs.
---

# Bug hunt

1. `npm ci && npm run status`. Collect candidate bugs from, in order:
   - `[bug]` items in `progress/BACKLOG.md` and "Known issues" in each `NOTES.md`;
   - GitHub issues labelled `bug` (if `gh` is available: `gh issue list --label bug`);
   - failing checks: `npm run check` (typecheck, unit tests, build, e2e smoke).
2. If nothing is logged, **hunt**: for each game, load it in Playwright, play it with scripted/randomised inputs for 30-60 s on a few `?seed=`s, collect `window.__arcade.errors` and console errors, check for stuck states (can't restart, score not updating, NaN in `getState()`), unfair or impossible content, and layout problems at mobile (390×844) and desktop sizes (screenshots).
3. For each confirmed bug: write a **failing test first** (unit test for logic, e2e for integration), fix the root cause minimally, confirm the test passes. Do not fix by weakening or deleting tests.
4. Log bugs you found but could not fix as `- [ ] [bug] [game:<slug>] …` in `progress/BACKLOG.md` with reproduction steps.
5. Fix at most ~5 bugs per session. Run `npm run check`, then **session-wrapup**. PR title `[fix] …`.
