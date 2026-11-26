# Neon Runner

**Type:** 3D · **Status:** playable · **Created:** 2026-11-20

## Concept
Endless lane runner on a synthwave highway. Three lanes; dodge neon walls (switch lane), jump low
barriers that span all lanes, collect coins. Speed ramps up with distance. Score = distance/2 + 10 per coin.

## Current state
- Complete core loop: start → run → crash → retry, persisted high score (localStorage).
- Controls: ←/→ or A/D lane, ↑/Space jump; touch: swipe to steer, tap to jump.
- Pure logic in `logic.ts` (11 unit tests); rendering in `game.ts` (instanced meshes, GlowLayer, fog).
- `?seed=N` URL param makes a run reproducible (used by e2e test).

## Next steps (highest value first)
1. Sound: tiny WebAudio synth blips for coin / jump / crash (no asset files).
2. Juice: particle burst on coin pickup and crash; speed lines at high speed.
3. Obstacle variety: moving walls, a "slide under" gate, power-ups (magnet, shield).
4. Difficulty/fairness pass: verify every generated row sequence is always survivable at MAX_SPEED.
5. On-screen touch hints for first-time mobile players.

## Design / technical notes
- Forward is +Z; lanes are -1/0/1 at x = lane * LANE_WIDTH. Camera sits behind the player.
- Floor, rails and grid lines follow the player rather than moving the world.
- Entity meshes are instances of three prototypes, created/disposed as `state.entities` changes.
- Deaths set `phase = 'dead'`; restart is delayed 0.5s to prevent accidental mash-restarts.

## Known issues
- none known
