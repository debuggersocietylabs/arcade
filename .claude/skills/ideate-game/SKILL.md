---
name: ideate-game
description: Think up one original browser-game concept with a pop-culture or trending hook and write it up as a buildable spec, without building it. Use for the scheduled "game idea" task or whenever asked to brainstorm a new game.
---

# Game ideation session

Output of this session = **one excellent, well-specified idea** committed to the repo (a spec file + backlog entry). **Do not write game code.** A later `new-game` session will build the best specs.

## 1. Orient
`npm run status`; skim `games/*/game.json`, `progress/BACKLOG.md` (all `[idea]` items, done or open) and `progress/ideas/` so you never repeat or near-duplicate an idea. Note the genres/2D-3D mix already covered; the new idea should add variety.

## 2. Find the zeitgeist
If web search/fetch tools are available, use them to see what is trending *right now* (give yourself ~10 minutes): viral game formats and mods, top free games/indie charts, memes and internet challenges, upcoming/just-released films, shows, music, sports events and seasons, tech/AI/space/science news, holidays and seasonal moments in the next 2 months. If no web access, say so in the spec and use what you know, favouring evergreen-but-current themes.
Record 3-5 concrete signals with a source/date each (e.g. "X genre dominating top charts this week").

## 3. Diverge, then converge
Write at least **8 raw concepts** (one line each), deliberately mixing a *mechanic* from one place with a *theme/format* from another. Then score the best 3 on: originality (is it a fresh twist, not a clone?), cultural relevance, **fun in a 2-5 minute session**, "explainable in one sentence", feasibility with procedural art and Babylon.js in ONE build session, mobile/touch friendly, variety vs existing games. Pick the winner.

## 4. Hard rules
- **Original, not derivative.** Take inspiration from trends, genres and themes; never use trademarked names, characters, logos, song lyrics or copyrighted worlds, and don't make a recognisable clone of one specific game. Parody/homage must be generic enough to be clearly its own thing. Invent an original title.
- No violence/gore/hate, nothing that targets real people. Family-friendly.
- No external assets: everything must be buildable from procedural meshes, emissive materials, WebAudio synthesis, CSS/emoji.

## 5. Write the spec
Create `progress/ideas/YYYY-MM-DD-<slug>.md`:
```markdown
# <Title>: <one-line pitch>
**Date:** … · **Type:** 2D|3D · **Slug:** <slug> · **Session length:** …
## Why now (cultural hook)
<signals with sources/dates, and how the game connects without copying>
## Core loop
<what the player does every few seconds, the goal, the fail/win state>
## Controls (keyboard + touch)
## Systems & content
<the rules that matter, difficulty ramp, what makes runs differ, scoring>
## Look & feel (procedural)
<palette, camera, shapes, juice, audio ideas>
## MVP scope (one session)
<the smallest version that is fun and complete>
## Stretch goals
## Risks / open questions
## Originality check
<closest existing games/IP and how this differs>
## Runner-ups
<the other 2 shortlisted ideas in 2 lines each>
```

## 6. Register it
Add a line at the TOP of "Ideas for new games" in `progress/BACKLOG.md`:
`- [ ] [idea] **<Title>** (<2D|3D>): <pitch>. Spec: progress/ideas/<file>.md` (tag it `★ trending` if cultural timing matters). Add the runner-ups as plain `[idea]` lines. Create `progress/log/YYYY-MM-DD-ideas.md`, then run the `session-wrapup` skill (PR titled `[idea] <Title>`; no `npm run check` failure may remain, though only docs changed).
