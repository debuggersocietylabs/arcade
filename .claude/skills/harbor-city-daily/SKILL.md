---
name: harbor-city-daily
description: Daily development session for Harbor City, the open-world 3D sandbox (games/harbor-city). Assess the current state honestly, then ship one meaningful improvement and update the roadmap. Use for the daily "improve the open-world game" scheduled task.
---

# Harbor City: daily assess-and-improve session

Harbor City is the arcade's flagship: an original, family-friendly open-world city sandbox (explore on foot, drive vehicles, interact with the world). The goal is steady compounding progress: **every session leaves it noticeably better and still working.** Read `games/harbor-city/NOTES.md` first: it holds the vision, roadmap and constraints.

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
Pick the **lowest-scoring dimension that has a cheap, high-impact fix**, plus the top roadmap item that fits. Scope: ONE substantial feature (or 2-3 small ones) that you can finish, test and ship in this session. Prefer things the player notices in the first minute. Write a 3-line plan before coding. Don't start something you cannot finish; stage big features behind a working first slice (e.g. missions: one mission type first).

## 4. Build
- Rules in `logic.ts` with unit tests first (pure; no Babylon/DOM); rendering/input in `game.ts`. If `logic.ts` or `game.ts` grows beyond ~700 lines, split into modules (`traffic.ts`, `missions.ts`, `world.ts`, `vehicles.ts`…), each with tests.
- Keep the `?seed=N` determinism and the `getState()` / `command()` hooks working; extend `getState()` with new fields so e2e tests can see them. Update `harbor-city.e2e.ts` for new user-facing flows.
- Performance budget: batch static scenery (thin instances / frozen instances), reuse materials, no per-frame allocations in hot loops where avoidable, no more than ~400 live meshes. The software-WebGL CI must still boot in <15 s.
- Constraints: no external assets/CDN, no real brands or copied names, **no violence/gore** (fun comes from driving, exploring, jobs, stunts, collecting, customising). Keep touch/mobile in mind; implementing the touch overlay is high priority until done.
- Don't remove existing features unless replacing them with something better; keep save data (localStorage keys) backwards compatible.

## 5. Verify
`npm run check` must pass. Re-take screenshots of the new work and compare against the assessment: did the targeted dimension actually improve? If not, iterate or revert the cosmetic part.

## 6. Record
- `games/harbor-city/NOTES.md`: update *Current state*, re-order and extend the *Roadmap* (add ideas you had while playing, drop done items), update *Known issues*.
- Create `progress/log/YYYY-MM-DD-harbor-city.md` with the **assessment table (scores + evidence)**, what you shipped, and "Suggested next session". Previous scores let the next session see the trend.
- Then run the `session-wrapup` skill (backlog, push branch `claude/harbor-city-<date>` for auto-merge; commit message prefixed `[game:harbor-city] <what you shipped>`).

`status` in game.json stays `wip` until: missions or other clear goals exist, touch controls work, there is ambient life (traffic or pedestrians) and sound. When all four are true, set `playable`.
