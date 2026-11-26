import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { createScene, emissiveMaterial, litMaterial } from '@shared/engine';
import { createInput } from '@shared/input';
import { getHighScore, submitHighScore } from '@shared/storage';
import type { GameContext, GameFactory, GameInstance } from '@shared/types';
import {
  BLOCK, BLOCKS, HALF, ROAD, WORLD_LIMIT, blockCenter, controlledVehicle, createState, focus, interact,
  nearestEnterable, roadLine, step, type Controls,
} from './logic';

const SLUG = 'harbor-city';
const SKY = '#9fd0ff';
const BUILDING_TINTS = ['#c9d6e8', '#e8cfc0', '#b8c4d6', '#d9d2e9', '#a9bcc9'];

interface VehicleView { root: TransformNode; wheels: Mesh[] }

export const createGame: GameFactory = ({ engine, canvas, hud }: GameContext): GameInstance => {
  const scene = createScene(engine, SKY);
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = Color3.FromHexString(SKY);
  scene.fogStart = 90;
  scene.fogEnd = 320;

  new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = 0.75;
  const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.35), scene);
  sun.intensity = 0.8;

  const camera = new UniversalCamera('cam', new Vector3(0, 5, -8), scene);
  camera.minZ = 0.3;
  camera.maxZ = 600;
  camera.fov = 0.9;

  const seedParam = Number(new URLSearchParams(location.search).get('seed'));
  const state = createState(Number.isFinite(seedParam) && seedParam > 0 ? seedParam : 1);

  // ---------------- static city ----------------
  const span = HALF * 2 + ROAD * 3;
  const ground = MeshBuilder.CreateGround('ground', { width: span + 400, height: span + 400 }, scene);
  ground.material = litMaterial(scene, 'asphalt', '#2f3138', 0);
  const grass = litMaterial(scene, 'grass', '#58a652', 0);
  const sidewalk = litMaterial(scene, 'sidewalk', '#9a9ca6', 0);
  const lineMat = emissiveMaterial(scene, 'lane', '#f3e9a6');

  const thin = (proto: Mesh, matrices: Matrix[]) => {
    proto.isVisible = true;
    for (const m of matrices) proto.thinInstanceAdd(m);
    proto.freezeWorldMatrix();
    return proto;
  };

  const sidewalkBlocks: Matrix[] = [], parkBlocks: Matrix[] = [];
  const parkKeys = new Set(state.parks.map((p) => `${p.x},${p.z}`));
  for (let i = 0; i < BLOCKS; i++) {
    for (let k = 0; k < BLOCKS; k++) {
      const x = blockCenter(i), z = blockCenter(k);
      (parkKeys.has(`${x},${z}`) ? parkBlocks : sidewalkBlocks).push(Matrix.Translation(x, 0.1, z));
    }
  }
  const sidewalkProto = MeshBuilder.CreateBox('sidewalk', { width: BLOCK, height: 0.2, depth: BLOCK }, scene);
  sidewalkProto.material = sidewalk;
  thin(sidewalkProto, sidewalkBlocks);
  const parkProto = MeshBuilder.CreateBox('park', { width: BLOCK, height: 0.2, depth: BLOCK }, scene);
  parkProto.material = grass;
  thin(parkProto, parkBlocks);

  // Dashed centre lines (skipping intersections).
  const dashZ: Matrix[] = [], dashX: Matrix[] = [];
  for (let j = 0; j <= BLOCKS; j++) {
    const line = roadLine(j);
    for (let t = -HALF; t <= HALF; t += 8) {
      const nearCross = Array.from({ length: BLOCKS + 1 }, (_, q) => Math.abs(t - roadLine(q))).some((d) => d < ROAD / 2 + 1);
      if (nearCross) continue;
      dashZ.push(Matrix.Translation(line, 0.03, t));
      dashX.push(Matrix.Translation(t, 0.03, line));
    }
  }
  const dashZProto = MeshBuilder.CreateBox('dashZ', { width: 0.3, height: 0.02, depth: 3 }, scene);
  const dashXProto = MeshBuilder.CreateBox('dashX', { width: 3, height: 0.02, depth: 0.3 }, scene);
  for (const p of [dashZProto, dashXProto]) p.material = lineMat;
  thin(dashZProto, dashZ);
  thin(dashXProto, dashX);

  // Buildings: one prototype per tint, scaled instances.
  const buildingProtos = BUILDING_TINTS.map((c, i) => {
    const m = MeshBuilder.CreateBox(`building${i}`, { size: 1 }, scene);
    m.material = litMaterial(scene, `building${i}`, c, 0.05);
    m.isVisible = false;
    return m;
  });
  for (const [n, b] of state.buildings.entries()) {
    const inst = buildingProtos[b.tint % buildingProtos.length]!.createInstance(`b${n}`);
    inst.position.set(b.x, b.h / 2, b.z);
    inst.scaling.set(b.w, b.h, b.d);
    inst.freezeWorldMatrix();
  }

  // World edge barriers so the boundary reads as intentional.
  const barrierMat = emissiveMaterial(scene, 'barrier', '#ff9f43');
  for (const [x, z, w, d] of [
    [0, WORLD_LIMIT + 1, WORLD_LIMIT * 2 + 2, 0.6], [0, -WORLD_LIMIT - 1, WORLD_LIMIT * 2 + 2, 0.6],
    [WORLD_LIMIT + 1, 0, 0.6, WORLD_LIMIT * 2 + 2], [-WORLD_LIMIT - 1, 0, 0.6, WORLD_LIMIT * 2 + 2],
  ] as const) {
    const b = MeshBuilder.CreateBox('edge', { width: w, height: 1, depth: d }, scene);
    b.material = barrierMat;
    b.position.set(x, 0.5, z);
  }

  // ---------------- vehicles ----------------
  const wheelMat = litMaterial(scene, 'wheel', '#15151a', 0);
  const glassMat = litMaterial(scene, 'glass', '#1c2733', 0.6);
  const lightMat = emissiveMaterial(scene, 'headlight', '#fff6c0');
  const bodyMats = new Map<string, ReturnType<typeof litMaterial>>();
  const bodyMat = (hex: string) => {
    let m = bodyMats.get(hex);
    if (!m) bodyMats.set(hex, (m = litMaterial(scene, `car${hex}`, hex, 0.4)));
    return m;
  };

  const buildCar = (id: number, color: string): VehicleView => {
    const root = new TransformNode(`car${id}`, scene);
    const part = (m: Mesh, x: number, y: number, z: number) => {
      m.parent = root;
      m.position.set(x, y, z);
      return m;
    };
    part(MeshBuilder.CreateBox('body', { width: 1.9, height: 0.6, depth: 4.2 }, scene), 0, 0.65, 0).material = bodyMat(color);
    part(MeshBuilder.CreateBox('cabin', { width: 1.65, height: 0.55, depth: 2.1 }, scene), 0, 1.2, -0.25).material = glassMat;
    for (const x of [-0.7, 0.7]) part(MeshBuilder.CreateBox('hl', { width: 0.35, height: 0.2, depth: 0.1 }, scene), x, 0.7, 2.12).material = lightMat;
    const wheels: Mesh[] = [];
    for (const [x, z] of [[-1, 1.35], [1, 1.35], [-1, -1.35], [1, -1.35]] as const) {
      const w = MeshBuilder.CreateCylinder('wheel', { diameter: 0.7, height: 0.3, tessellation: 14 }, scene);
      w.rotation.z = Math.PI / 2;
      w.material = wheelMat;
      wheels.push(part(w, x * 0.95, 0.35, z));
    }
    return { root, wheels };
  };
  const carViews = new Map<number, VehicleView>(state.vehicles.map((v) => [v.id, buildCar(v.id, v.color)]));

  // ---------------- player + pickups ----------------
  const playerMesh = MeshBuilder.CreateCapsule('player', { radius: 0.38, height: 1.8 }, scene);
  playerMesh.material = litMaterial(scene, 'player', '#ff5e57', 0.1);
  const cashMat = emissiveMaterial(scene, 'cash', '#7dff8a');
  const pickupMeshes = state.pickups.map((p) => {
    const m = MeshBuilder.CreateBox(`cash${p.id}`, { width: 0.9, height: 0.5, depth: 0.5 }, scene);
    m.material = cashMat;
    m.position.set(p.x, 0.9, p.z);
    return m;
  });

  // ---------------- input ----------------
  let introVisible = true;
  const dismissIntro = () => {
    if (introVisible) {
      introVisible = false;
      hud.showOverlay(null);
    }
  };
  hud.showOverlay({
    title: 'HARBOR CITY',
    lines: ['WASD / arrows: move & drive · Shift: run', 'E: enter / exit car · Space: handbrake', 'Press any key to start exploring'],
  });

  const doInteract = () => {
    dismissIntro();
    interact(state);
  };
  const input = createInput(canvas, (cmd) => {
    if (cmd === 'interact' || cmd === 'tap') doInteract(); // Space ('action') is the handbrake, not interact
    else dismissIntro();
  });
  const readControls = (): Controls => ({
    throttle: (input.isDown('up') ? 1 : 0) - (input.isDown('down') ? 1 : 0),
    steer: (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0),
    handbrake: input.isDown('action'),
    run: input.isDown('run'),
  });

  // ---------------- loop ----------------
  let camHeading = 0;
  let best = getHighScore(SLUG);
  const angleLerp = (a: number, b: number, t: number) => {
    const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
    return a + d * t;
  };

  engine.runRenderLoop(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
    const c = readControls();
    if (introVisible && (c.throttle !== 0 || c.steer !== 0)) dismissIntro();
    step(state, dt, c);

    // Vehicles.
    for (const v of state.vehicles) {
      const view = carViews.get(v.id)!;
      view.root.position.set(v.x, 0, v.z);
      view.root.rotation.y = v.heading;
      for (const w of view.wheels) w.rotation.x += (v.speed * dt) / 0.35;
    }
    const driving = controlledVehicle(state);
    playerMesh.setEnabled(!driving);
    playerMesh.position.set(state.player.x, 0.9, state.player.z);
    playerMesh.rotation.y = state.player.heading;

    // Pickups.
    state.pickups.forEach((p, i) => {
      const m = pickupMeshes[i]!;
      m.setEnabled(!p.taken);
      m.rotation.y = state.time * 2.5;
      m.position.y = 0.9 + Math.sin(state.time * 3 + i) * 0.15;
    });

    // Chase camera.
    const f = focus(state);
    camHeading = angleLerp(camHeading, f.heading, 1 - Math.exp(-dt * (driving ? 3.5 : 6)));
    const speed = driving ? Math.abs(driving.speed) : 0;
    const dist = driving ? 10 + speed * 0.12 : 6.5;
    const height = driving ? 4.6 + speed * 0.04 : 3.2;
    const target = new Vector3(f.x, driving ? 1.4 : 1.6, f.z);
    const wanted = new Vector3(f.x - Math.sin(camHeading) * dist, height, f.z - Math.cos(camHeading) * dist);
    camera.position = Vector3.Lerp(camera.position, wanted, 1 - Math.exp(-dt * 8));
    camera.setTarget(target.add(new Vector3(Math.sin(camHeading) * 3, 0, Math.cos(camHeading) * 3)));
    camera.fov = 0.9 + Math.min(speed / 32, 1) * 0.2;

    // HUD.
    if (state.cash > best) best = submitHighScore(SLUG, state.cash);
    hud.setStats({ Cash: `$${state.cash}`, Best: `$${best}`, ...(driving ? { Speed: `${Math.round(Math.abs(driving.speed) * 3.6)} km/h` } : {}) });
    if (driving) hud.setHint(Math.abs(driving.speed) > 10 ? null : 'E: exit car');
    else hud.setHint(nearestEnterable(state) ? 'E: enter car' : null);

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
      mode: state.mode, cash: state.cash, crashes: state.crashes, x: focus(state).x, z: focus(state).z,
      heading: focus(state).heading, speed: controlledVehicle(state)?.speed ?? 0,
      canEnter: nearestEnterable(state) !== undefined,
    }),
    command(name) {
      if (name === 'interact') doInteract();
    },
  };
};
