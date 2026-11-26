---
name: session-wrapup
description: Finish an autonomous session correctly: update NOTES.md, BACKLOG.md, write the progress log entry, run checks, commit and push the branch for auto-merge. Run at the end of every session that changed the repo.
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
5. **Deliver.** Commit on a branch named `claude/<kind>-<slug>-<YYYY-MM-DD>` (imperative message explaining why) and push it: `git push -u origin <branch>`. Do **not** push to `main` directly and do not open a PR: the `auto-merge.yml` GitHub Action re-runs all checks, rebases onto `main`, merges, deletes the branch and deploys the site. Never force-push, never edit `.github/workflows/`. Only push when `npm run check` passes (if the only blocker is an environment limit such as being unable to install the Playwright browser, push anyway but say so in the log). If your task prompt explicitly asks for a PR instead, open one to `main`.
6. Finish with a brief final message: what changed, the branch name, anything needing a human.
