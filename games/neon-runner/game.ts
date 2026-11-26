import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { createScene, emissiveMaterial } from '@shared/engine';
import { createInput } from '@shared/input';
import { getHighScore, submitHighScore } from '@shared/storage';
import type { GameContext, GameFactory, GameInstance } from '@shared/types';
import {
  BARRIER_HEIGHT, LANE_WIDTH, SPAWN_AHEAD, createState, dispatch, score, step,
  type Command, type State,
} from './logic';

const SLUG = 'neon-runner';
const GRID_SPACING = 6;
const GRID_ROWS = Math.ceil(SPAWN_AHEAD / GRID_SPACING) + 4;
const RESTART_DELAY = 0.5; // seconds before a dead player can restart (prevents mash-restarts)

export const createGame: GameFactory = ({ engine, canvas, hud }: GameContext): GameInstance => {
  const scene = createScene(engine, '#06050f');
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = Color3.FromHexString('#06050f');
  scene.fogStart = 40;
  scene.fogEnd = SPAWN_AHEAD + 10;

  new HemisphericLight('light', new Vector3(0, 1, -0.3), scene).intensity = 0.8;
  const glow = new GlowLayer('glow', scene, { blurKernelSize: 24 });
  glow.intensity = 0.8;

  const camera = new UniversalCamera('cam', new Vector3(0, 5, -9), scene);
  camera.fov = 1.0;
  camera.minZ = 0.5;
  camera.maxZ = SPAWN_AHEAD + 40;

  // ---- materials ----
  const mat: Record<string, StandardMaterial> = {
    player: emissiveMaterial(scene, 'player', '#22e6ff'),
    dead: emissiveMaterial(scene, 'dead', '#ff2a2a'),
    wall: emissiveMaterial(scene, 'wall', '#ff2fb3'),
    barrier: emissiveMaterial(scene, 'barrier', '#ff9d1c'),
    coin: emissiveMaterial(scene, 'coin', '#ffe94a'),
    grid: emissiveMaterial(scene, 'grid', '#3d2bff'),
    rail: emissiveMaterial(scene, 'rail', '#22e6ff'),
    floor: emissiveMaterial(scene, 'floor', '#0b0a1c'),
  };

  // ---- static-ish scenery that follows the player ----
  const floorWidth = LANE_WIDTH * 3 + 1;
  const floor = MeshBuilder.CreateBox('floor', { width: floorWidth, height: 0.2, depth: SPAWN_AHEAD + 60 }, scene);
  floor.material = mat.floor!;
  floor.position.y = -0.1;
  const rails: Mesh[] = [-1, 1].map((side) => {
    const r = MeshBuilder.CreateBox('rail', { width: 0.15, height: 0.3, depth: SPAWN_AHEAD + 60 }, scene);
    r.material = mat.rail!;
    r.position.set((side * floorWidth) / 2, 0.1, 0);
    return r;
  });
  const dividers: Mesh[] = [-0.5, 0.5].map((lane) => {
    const d = MeshBuilder.CreateBox('divider', { width: 0.05, height: 0.02, depth: SPAWN_AHEAD + 60 }, scene);
    d.material = mat.grid!;
    d.position.set(lane * LANE_WIDTH, 0.02, 0);
    return d;
  });
  const gridProto = MeshBuilder.CreateBox('gridProto', { width: floorWidth, height: 0.03, depth: 0.08 }, scene);
  gridProto.material = mat.grid!;
  gridProto.isVisible = false;
  const gridLines: InstancedMesh[] = Array.from({ length: GRID_ROWS }, (_, i) => gridProto.createInstance(`grid${i}`));

  // ---- entity prototypes (instanced for cheap spawning) ----
  const wallProto = MeshBuilder.CreateBox('wallProto', { width: LANE_WIDTH * 0.85, height: 2.4, depth: 1 }, scene);
  wallProto.material = mat.wall!;
  const barrierProto = MeshBuilder.CreateBox('barrierProto', { width: LANE_WIDTH * 0.95, height: BARRIER_HEIGHT, depth: 0.7 }, scene);
  barrierProto.material = mat.barrier!;
  const coinProto = MeshBuilder.CreateCylinder('coinProto', { diameter: 0.9, height: 0.15, tessellation: 20 }, scene);
  coinProto.material = mat.coin!;
    for (const p of [wallProto, barrierProto, coinProto]) p.isVisible = false;

  const player = MeshBuilder.CreateBox('player', { size: 1.1 }, scene);
  player.material = mat.player!;

  const meshes = new Map<number, InstancedMesh>();

  // ---- game state ----
  const urlSeed = Number(new URLSearchParams(location.search).get('seed'));
  const newState = () => createState(Number.isFinite(urlSeed) && urlSeed > 0 ? urlSeed : (Math.random() * 2 ** 31) | 0);
  let state: State = newState();
  let best = getHighScore(SLUG);
  let deadFor = 0;
  let shake = 0;

  const showReady = () =>
    hud.showOverlay({
      title: 'NEON RUNNER',
      lines: ['← → / A D: change lane   ↑ / Space: jump', 'Swipe to steer, tap to jump', 'Press Space or tap to start'],
    });
  showReady();

  const handle = (cmd: Command) => {
    if (state.phase === 'dead') {
      if ((cmd === 'jump' || cmd === 'start') && deadFor > RESTART_DELAY) restart();
      return;
    }
    if (state.phase === 'ready') {
      // Any jump/start input begins the run; steering alone does not.
      if (cmd === 'jump' || cmd === 'start') {
        dispatch(state, 'start');
        hud.showOverlay(null);
      }
      return;
    }
    dispatch(state, cmd);
  };

  const restart = () => {
    state = newState();
    deadFor = 0;
    shake = 0;
    for (const m of meshes.values()) m.dispose();
    meshes.clear();
    dispatch(state, 'start');
    hud.showOverlay(null);
  };

  const input = createInput(canvas, (cmd) => {
    if (cmd === 'left' || cmd === 'right') handle(cmd);
    else if (cmd === 'up' || cmd === 'action') handle('jump');
  });

  let wasDead = false;
  const sync = (dt: number) => {
    // Entities.
    const live = new Set<number>();
    for (const e of state.entities) {
      live.add(e.id);
      let m = meshes.get(e.id);
      if (!m) {
        const proto = e.kind === 'wall' ? wallProto : e.kind === 'barrier' ? barrierProto : coinProto;
        m = proto.createInstance(`e${e.id}`);
        if (e.kind === 'coin') m.rotation.x = Math.PI / 2;
        meshes.set(e.id, m);
      }
      m.position.set(e.lane * LANE_WIDTH, e.kind === 'wall' ? 1.2 : e.kind === 'barrier' ? BARRIER_HEIGHT / 2 : 0.9, e.z);
      if (e.kind === 'coin') m.rotation.y = state.time * 4 + e.id;
    }
    for (const [id, m] of meshes) {
      if (!live.has(id)) {
        m.dispose();
        meshes.delete(id);
      }
    }

    // Player.
    player.position.set(state.x, 0.55 + state.y, state.z);
    player.rotation.z = -(state.x - state.lane * LANE_WIDTH) * 0.2;
    player.rotation.x = state.grounded ? 0 : -state.vy * 0.03;
    player.material = state.phase === 'dead' ? mat.dead! : mat.player!;

    // Scenery follows the player.
    floor.position.z = state.z + 40;
    for (const r of rails) r.position.z = state.z + 40;
    for (const d of dividers) d.position.z = state.z + 40;
    const base = Math.floor(state.z / GRID_SPACING) * GRID_SPACING;
    gridLines.forEach((g, i) => g.position.set(0, 0.02, base + (i - 2) * GRID_SPACING));

    // Camera.
    shake = Math.max(0, shake - dt);
    const sx = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
    const sy = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
    camera.position.set(state.x * 0.6 + sx, 5 + sy, state.z - 9);
    camera.setTarget(new Vector3(state.x * 0.4, 1.2, state.z + 14));
    camera.fov = 0.95 + ((state.speed - 14) / 18) * 0.25;
  };

  engine.runRenderLoop(() => {
    const dt = engine.getDeltaTime() / 1000;
    step(state, dt);
    if (state.phase === 'dead') {
      deadFor += dt;
      if (!wasDead) {
        wasDead = true;
        shake = 0.35;
        const final = score(state);
        best = submitHighScore(SLUG, final);
        hud.showOverlay({
          title: 'CRASHED',
          lines: [`Score ${final}   ·   Best ${best}`, 'Press Space or tap to retry'],
        });
      }
    } else {
      wasDead = false;
    }
    hud.setStats({ Score: score(state), Coins: state.coins, Best: Math.max(best, score(state)) });
    sync(dt);
    scene.render();
  });

  return {
    dispose() {
      engine.stopRenderLoop();
      input.dispose();
      scene.dispose();
      hud.dispose();
    },
    getState: () => ({
      phase: state.phase, score: score(state), coins: state.coins, lane: state.lane,
      x: state.x, y: state.y, z: state.z, speed: state.speed,
    }),
    command(name) {
      if (name === 'left' || name === 'right' || name === 'jump' || name === 'start') handle(name);
    },
  };
};
