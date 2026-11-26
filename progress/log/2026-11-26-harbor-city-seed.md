# 2026-11-26 · Harbor City v0 seeded; ideation + daily skills added

**Type:** new-game / infra · **Games touched:** harbor-city

## What was done
- Created `games/harbor-city`: procedural 8×8 city, on-foot movement, enterable/drivable cars, cash pickups, chase camera. 15 unit tests + e2e.
- Shared lib: `interact`/`run`/`tap` inputs, `hud.setHint`, `litMaterial`.
- Added skills `harbor-city-daily` and `ideate-game`; `progress/ideas/` for idea specs.
- Fixed flaky Neon Runner e2e timeout (software WebGL is slow under parallel workers).

## Initial assessment (human-written baseline for later sessions)
| Dimension | Score | Evidence |
| --- | --- | --- |
| Feel | 3 | Driving is responsive; on-foot tank controls stiff |
| Visuals | 2 | Flat boxes, dark building faces, no windows/props |
| World | 2 | Empty streets, no traffic/people |
| Gameplay | 1 | Only collect cash; no goals |
| Interactions | 2 | Enter/exit cars only |
| Polish | 1 | No sound, particles, minimap or touch |
| Stability | 4 | All checks green |

## Suggested next session
- Touch controls overlay or the visual/lighting pass, then a first courier mission.
