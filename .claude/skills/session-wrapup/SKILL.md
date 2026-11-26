---
name: session-wrapup
description: Finish an autonomous session correctly: update NOTES.md, BACKLOG.md, write the progress log entry, run checks, commit, push and open a PR. Run at the end of every session that changed the repo.
---

# Session wrap-up (do not skip: this is how the next session knows what happened)

1. `npm run check` must pass. If something cannot be made to pass, do not hide it: record it under Known issues and in the log, and say so in the PR.
2. Update `games/<slug>/NOTES.md` for every game touched (Current state, Next steps, Known issues).
3. Update `progress/BACKLOG.md`: tick finished items (`- [x]`, move to **Done** with date), add newly discovered items. Keep at least 3 open `[idea]` items so future sessions always have something to build.
4. Create `progress/log/YYYY-MM-DD-<short-slug>.md` (new file, never edit old ones):

   ```markdown
   # YYYY-MM-DD · <one-line summary>

   **Type:** new-game | continue-game | fix | infra · **Games touched:** <slugs>

   ## What was done
   - …

   ## State left behind
   - Checks: pass/fail (details). Game status: playable/wip.

   ## Suggested next session
   - …
   ```
5. Commit on a `claude/<kind>-<slug>` branch (imperative message, explain why), push, open a PR to `main` with a short summary and test results. Do not merge or push to `main` unless the task explicitly allows it.
6. Finish with a brief final message: what changed, PR/branch name, anything needing a human.
