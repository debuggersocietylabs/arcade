---
name: harbor-city-daily
description: Daily development session for Harbor City, the open-world 3D sandbox (games/harbor-city). Assess the current state honestly, then ship one meaningful improvement and update the roadmap. Use for the daily "improve the open-world game" scheduled task.
---

# Harbor City: daily assess-and-improve session

Harbor City is the arcade's flagship: an original, family-friendly open-world city sandbox (explore on foot, drive vehicles, interact with the world). The goal is ambitious compounding progress: **every session makes it more complex, more feature-rich and better looking, while still working.** Think big-city sandbox: many interlocking systems, depth, and graphics that keep improving. Read `games/harbor-city/NOTES.md` first: it holds the vision, roadmap and constraints.

## 1. Orient (5 min)
`npm ci && npm run status`. Read `games/harbor-city/NOTES.md`, the open `[game:harbor-city]` and `[bug]` items in `progress/BACKLOG.md`, and the last 3 `progress/log/*harbor-city*` entries (they contain previous assessments and scores).

## 2. Assess (this is required, not optional)
Build and serve (`npm run build && npx vite preview --port 4173`), then drive the game with Playwright (launch args `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`; see `game-dev-guide`). Play it with scripted input: walk, enter a car, drive down streets, crash into things, exit. Take at least 4 screenshots (on foot, driving, a street view, any new feature) at 1280×720 **and one at 390×844**, and LOOK at them (Read the PNGs).

Score each dimension 1-5 and write one concrete sentence of evidence for each:
| Dimension | Ask yourself |
| --- | --- |
| Feel | Do walking/driving/camera feel good? Any jank, stiffness, clipping, camera in walls? |
| Visuals | Lighting, colour, readability, variety, any ugly/placeholder looks? |
| World | Is there enough to see and do? Density, landmarks, variety, life (traffic/people)? |
| Gameplay | Is there a goal or loop that pulls the player forward (missions, progression, rewards)? |
| Interactions | Vehicles, items, doors/props: how many things can the player actually interact with? |
| Polish | Sound, particles, HUD, menus, minimap, feedback, mobile/touch support |
| Stability | Console errors, test health, performance (draw calls, instance counts, frame time), bugs |

Fix any **Stability** score ≤ 2 first (broken > fancy).

## 3. Decide
Every session ships **all three** of:
1. **Depth:** at least one substantial new feature or system that makes the game more complex and gives the player something new to do (e.g. missions, traffic, pedestrians, vehicle types, economy, garage, day/night effects on gameplay, stunts, new districts, weather). Prefer systems that interact with ones already there over isolated gimmicks.
2. **Graphics:** a clearly visible visual upgrade (e.g. building windows and facades via DynamicTexture, shadows, sky and lighting, day/night, better vehicle and character models, props and trees, water, particles, post-processing). All procedural: no external assets.
3. **Quality:** fix the worst problem your assessment found (feel, bugs, performance, controls).

Be ambitious: a full session's worth of work, not a tweak. Write a short plan first. Build big features as a working first slice, then deepen them in this and later sessions. Never ship something half-broken; if it cannot be finished, keep what works and move the rest to the roadmap. The roadmap is a starting point: extend it with your own ideas so it never runs out.

## 4. Build
- Rules in `logic.ts` with unit tests first (pure; no Babylon/DOM); rendering/input in `game.ts`. If `logic.ts` or `game.ts` grows beyond ~700 lines, split into modules (`traffic.ts`, `missions.ts`, `world.ts`, `vehicles.ts`…), each with tests.
- Keep the `?seed=N` determinism and the `getState()` / `command()` hooks working; extend `getState()` with new fields so e2e tests can see them. Update `harbor-city.e2e.ts` for new user-facing flows.
- Performance budget: batch static scenery (thin instances / frozen instances), reuse materials, no per-frame allocations in hot loops where avoidable, keep draw calls low (instancing, merging, LOD/culling) so it stays smooth on an ordinary laptop and phone. The software-WebGL CI must still boot in <15 s: put expensive effects (shadows, post-processing) behind a quality setting that drops them on software rendering or `?quality=low`.
- Constraints: no external assets/CDN, no real brands or copied names, **no violence/gore** (fun comes from driving, exploring, jobs, stunts, collecting, customising). Keep touch/mobile in mind; implementing the touch overlay is high priority until done.
- Don't remove existing features unless replacing them with something better; keep save data (localStorage keys) backwards compatible.

## 5. Verify
`npm run check` must pass. Re-take the same screenshots and compare before and after: is the new feature usable, and does it visibly look better? If not, iterate.

## 6. Record
- `games/harbor-city/NOTES.md`: update *Current state*, re-order and extend the *Roadmap* (add ideas you had while playing, drop done items), update *Known issues*.
- Create `progress/log/YYYY-MM-DD-harbor-city.md` with the **assessment table (scores + evidence)**, what you shipped, and "Suggested next session". Previous scores let the next session see the trend.
- Then run the `session-wrapup` skill (backlog, push branch `claude/harbor-city-<date>` for auto-merge; commit message prefixed `[game:harbor-city] <what you shipped>`).

`status` in game.json stays `wip` until: missions or other clear goals exist, touch controls work, there is ambient life (traffic or pedestrians) and sound. When all four are true, set `playable`.
