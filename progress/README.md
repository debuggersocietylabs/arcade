# Progress tracking

Claude Code's scheduled cloud sessions start with no memory. This folder is the memory.

| What | Where | Rule |
| --- | --- | --- |
| Work queue (ideas, bugs, per-game todos) | `progress/BACKLOG.md` | Read first, update before finishing |
| Session history | `progress/log/YYYY-MM-DD-<slug>.md` | One new file per session (never edit old ones) → no merge conflicts |
| Per-game state & next steps | `games/<slug>/NOTES.md` | Update whenever the game changes |
| Game metadata | `games/<slug>/game.json` | Drives the landing page card |

Run `npm run status` for a one-screen summary of all of the above.

Log entry template: see `.claude/skills/session-wrapup/SKILL.md`.
