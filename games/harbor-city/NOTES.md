# Harbor City

**Type:** 3D · **Status:** wip · **Created:** 2026-11-26

## Vision
An original, family-friendly open-world sandbox in the spirit of the classic "go anywhere, drive anything" city games:
a living procedurally generated city you can explore on foot, with vehicles to drive, things to collect and (eventually)
jobs/missions, traffic, pedestrians, a day/night cycle and a minimap. **No violence/gore, no real brands, no copied
names or assets.** Think courier/taxi/racing gigs, stunt ramps, collectibles, customisation, not crime.

## Current state (v0 foundation)
- Procedural 8x8-block city (seeded: `?seed=N`): roads, sidewalks, parks, ~250 buildings (taller downtown), world-edge barriers.
- On foot: walk/run/turn (tank-style), collides with buildings and cars.
- ~12 parked cars of several colours: press E near one to enter; E to exit (not above 10 u/s). Arcade driving model:
  acceleration/reverse/brakes/handbrake, speed-sensitive steering, wheel spin, crash bounce off buildings, car-to-car shoving.
- 60 cash pickups scattered on the roads; high score = best cash.
- Chase camera (smoothed heading, FOV widens with speed).
- Pure rules in `logic.ts` (15 unit tests), e2e test drives a car and exits it.

## Roadmap (the daily session picks from here and keeps extending it; every session adds depth AND a graphics upgrade)
0. **Graphics track:** lit windows and facades, shadows, sky + day/night, detailed car and character models, trees/street props, water, particles, post-processing (procedural or CC0 assets, see CLAUDE.md "Assets"; with a low-quality fallback).
1. **Touch controls overlay** (virtual stick + enter/handbrake buttons) so it is playable on phones.
2. **Minimap + compass** (DOM canvas) with player, cars and pickups.
3. **Missions**: courier delivery (A→B with timer, pay on arrival), taxi fares, checkpoint races. Mission HUD + marker beacon.
4. **Traffic**: AI cars following road lanes and stopping at intersections; pedestrians on sidewalks (harmless, they dodge).
5. **Vehicle variety**: sports car, van, motorbike, bus, each with own handling; vehicle spawner/garage.
6. **World richness**: day/night cycle with street lights and lit windows, trees/props, ramps, a harbor/water area, bridge.
7. **Feel**: engine sound + tyre squeal + ambience via WebAudio, skid marks, particles, shadows, damage.
8. **Camera**: mouse look / camera-relative on-foot movement, first-person toggle.
9. **Progression**: spend cash on car colours/upgrades, save slots in localStorage.

## Technical notes
- Coordinates: X right, Z forward/north. Heading 0 faces +Z, positive turns toward +X. Forward = (sin h, cos h).
- Roads are implicit: the city is a grid, road centre lines at `roadLine(j)`, blocks at `blockCenter(i)`. Collision is circle-vs-AABB (`resolveBuildings`).
- Static scenery uses thin instances (sidewalks, lane dashes) and frozen instanced buildings: keep new scenery batched.
- If the world grows, chunk/stream it rather than raising BLOCKS a lot (perf in software-WebGL CI is poor).

## Known issues
- Keyboard only (no touch yet). Tank-style on-foot controls feel stiff.
- No sound, no traffic, no pedestrians, no missions yet.
