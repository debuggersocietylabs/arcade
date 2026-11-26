---
name: game-dev-guide
description: Practical patterns and gotchas for building 2D and 3D games with Babylon.js in this repo (imports, 2D with an orthographic camera, instancing, input, juice, performance, testing). Read before writing game.ts.
---

# Game development guide

## Structure
`logic.ts` = pure rules `State`, `step(state, dt, …)`, `dispatch(state, cmd)`, unit tested. `game.ts` = `createGame({engine, canvas, hud})` that builds the scene, runs `engine.runRenderLoop`, syncs meshes from state, and returns `{dispose, getState, command}`. See `games/neon-runner` (3D) and `templates/` (2D & 3D).

## Babylon
- Deep imports only (`@babylonjs/core/Meshes/meshBuilder`, `.../Lights/hemisphericLight`). Missing side effects show as a runtime error naming the module: add it to `src/shared/engine.ts`.
- Clamp `dt` (tab-switch spikes): `Math.min(dt, 0.05)`.
- Use `createInstance()` for many identical meshes; create/dispose by diffing against `state.entities` (see neon-runner). Reuse materials.
- Glow: `GlowLayer` for neon look; fog (`scene.fogMode`) hides pop-in. Left-handed coords: +Z forward from the default camera, +X right, +Y up.
- **2D**: `createOrthoCamera2D(scene, height)`; flat meshes (`CreatePlane`, `CreateDisc`) at z = 0, z-order via small z offsets. Visible world height is fixed; width follows the aspect ratio, so clamp gameplay to a safe-area width.
- Art: procedural meshes and `DynamicTexture`, or CC0 models/textures committed under `games/<slug>/assets/` (rules in CLAUDE.md "Assets"; load `.glb` with `loadModel` from `@shared/models`). Sound: WebAudio oscillators. Icons: emoji.
- Models are PBR: if they look dark, add stronger lights or an environment texture, or lower `metallic`. Scale and orientation vary between packs, so normalise them after loading.

## Feel and fairness
- Add "juice": screen shake on hit, particles (`ParticleSystem` with a generated texture), eased camera, speed ramps, score pop-ups.
- Always guarantee generated content is survivable (test it over many seeds).
- Difficulty should ramp smoothly and cap.

## Input
`createInput(canvas, onCommand)`: keyboard (arrows/WASD/Space/Enter/P/Esc) and touch (swipes = directions, tap = `action`); `isDown()` for held keys. Provide a pause on `pause` if the game has long sessions.

## Testing
Unit-test `logic.ts`. For e2e use `?seed=N`, `window.__arcade.game.getState()` and `command()`. Headless Chromium uses software WebGL (slow): poll with `expect.poll`, don't rely on exact frame timing.
Screenshot recipe: `npm run build && npx vite preview --port 4173`, then Playwright `page.screenshot` with launch args `--use-angle=swiftshader --enable-unsafe-swiftshader`.
