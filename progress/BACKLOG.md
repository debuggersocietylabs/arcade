# Backlog

The persistent work queue for autonomous Claude sessions (and humans). Read it at the start of every
session, update it before you finish. Keep items small enough to finish in one session.

Format: `- [ ] [tag] description` → mark done with `- [x]` and move to **Done** (keep the last ~20 there).
Tags: `[idea]` new game idea · `[game:<slug>]` work on an existing game · `[bug]` defect · `[infra]` shell/tooling/CI.

## Ideas for new games
<!-- Pick the one that adds the most variety to the arcade (genre, 2D vs 3D, session length). -->
- [ ] [idea] **Orbit Defender** (2D): rotate a turret around a planet, shoot waves of incoming asteroids. Arcade shooter, score + waves.
- [ ] [idea] **Block Drop** (2D): original falling-blocks puzzle with a twist (e.g. blocks of 3 colours that clear in matching lines).
- [ ] [idea] **Gravity Golf** (3D): put a ball in the hole across short procedurally generated courses with ramps; stroke counter.
- [ ] [idea] **Snake 3D** (3D): classic snake on a cube/torus surface with a chase camera.
- [ ] [idea] **Memory Grid** (2D): Simon-style pattern memory game with growing sequences and streak score.
- [ ] [idea] **Tower Stack** (3D): time the drop of sliding slabs to build the tallest tower; overhangs get trimmed.
- [ ] [idea] **Asteroid Mine** (2D): inertia-based ship, mine rocks for ore, avoid collisions, upgrade between rounds.

## Existing games
- [ ] [game:neon-runner] Add WebAudio blips (coin / jump / crash) with a mute toggle.
- [ ] [game:neon-runner] Particle burst on coin pickup and crash.
- [ ] [game:neon-runner] New obstacle types: moving wall, power-up (shield).

## Bugs
<!-- Add `- [ ] [bug] [game:<slug>] what happens / how to reproduce`. -->

## Infra
- [ ] [infra] Add a shared `src/shared/audio.ts` WebAudio helper so games can make sounds without asset files.
- [ ] [infra] Add a shared touch-controls overlay (on-screen buttons) for mobile.

## Done
- [x] [idea] Neon Runner (3D lane runner), first playable game. (2026-11-20)
