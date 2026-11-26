import { Rng } from '@shared/rng';

/**
 * Pure rules for Harbor City, an open-world sandbox. No Babylon, no DOM.
 * World: X right, Z forward (north), Y up (rendering only). Heading 0 faces +Z; positive heading turns toward +X.
 * Forward vector = (sin h, cos h); right vector = (cos h, -sin h).
 */

// ---- city layout ----
export const BLOCKS = 8; // BLOCKS x BLOCKS city blocks
export const BLOCK = 40; // block edge length
export const ROAD = 12; // road width
export const PITCH = BLOCK + ROAD; // distance between parallel road centre lines
export const HALF = (BLOCKS * PITCH) / 2; // outermost road centre line is at +/- HALF
export const WORLD_LIMIT = HALF + ROAD / 2 - 1; // entities are clamped to +/- this

/** X (or Z) coordinate of road centre line j, j = 0..BLOCKS. */
export const roadLine = (j: number) => (j - BLOCKS / 2) * PITCH;
/** Centre coordinate of block i, i = 0..BLOCKS-1. */
export const blockCenter = (i: number) => (i - (BLOCKS - 1) / 2) * PITCH;

// ---- tuning ----
export const WALK_SPEED = 5;
export const RUN_SPEED = 9;
export const FOOT_TURN = 2.8;
export const PLAYER_RADIUS = 0.5;
export const CAR_RADIUS = 1.8;
export const ENTER_RANGE = 3.8;
export const MAX_SPEED = 32;
export const MAX_REVERSE = 9;
export const ACCEL = 16;
export const REVERSE_ACCEL = 9;
export const BRAKE = 34;
export const HANDBRAKE = 45;
export const TURN_RATE = 1.9;
export const MAX_EXIT_SPEED = 10;
export const PICKUP_RADIUS = 2.4;

export interface Building { x: number; z: number; w: number; d: number; h: number; tint: number }
export interface Vehicle { id: number; x: number; z: number; heading: number; speed: number; color: string; occupied: boolean }
export interface Pickup { id: number; x: number; z: number; value: number; taken: boolean }
export interface Mover { x: number; z: number; heading: number }

export type Mode = 'foot' | 'driving';

export interface State {
  rng: Rng;
  time: number;
  mode: Mode;
  player: Mover;
  vehicleId: number | null;
  vehicles: Vehicle[];
  buildings: Building[];
  /** Block centres that are parks (no buildings). */
  parks: { x: number; z: number }[];
  pickups: Pickup[];
  cash: number;
  crashes: number;
  nextId: number;
}

export interface Controls {
  throttle: number; // -1..1 (forward / back)
  steer: number; // -1..1 (left / right)
  handbrake: boolean;
  run: boolean;
}
export const NO_CONTROLS: Controls = { throttle: 0, steer: 0, handbrake: false, run: false };

const CAR_COLORS = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#f1c40f', '#9b5de5', '#ecf0f1', '#ff6b9d'];

export function createState(seed = 1): State {
  const rng = new Rng(seed);
  const s: State = {
    rng, time: 0, mode: 'foot', player: { x: 0, z: 0, heading: 0 }, vehicleId: null,
    vehicles: [], buildings: [], parks: [], pickups: [], cash: 0, crashes: 0, nextId: 1,
  };

  // Buildings: 2x2 lots per block, taller toward the city centre; ~12% of blocks are parks.
  for (let i = 0; i < BLOCKS; i++) {
    for (let k = 0; k < BLOCKS; k++) {
      const cx = blockCenter(i), cz = blockCenter(k);
      if (rng.next() < 0.12) {
        s.parks.push({ x: cx, z: cz });
        continue;
      }
      const centrality = 1 - Math.hypot(cx, cz) / (HALF * 1.2);
      for (const ox of [-10, 10]) {
        for (const oz of [-10, 10]) {
          if (rng.next() < 0.1) continue; // empty lot
          const w = rng.int(12, 16), d = rng.int(12, 16);
          const h = Math.round(8 + rng.next() * (10 + 40 * Math.max(0, centrality)));
          s.buildings.push({ x: cx + ox + (rng.next() - 0.5), z: cz + oz + (rng.next() - 0.5), w, d, h, tint: rng.int(0, 4) });
        }
      }
    }
  }

  // Parked cars along the right-hand side of road segments; the first is right next to the spawn.
  const addCar = (x: number, z: number, heading: number) => {
    s.vehicles.push({ id: s.nextId++, x, z, heading, speed: 0, color: rng.pick(CAR_COLORS), occupied: false });
  };
  addCar(2.5, 2.5, 0);
  for (let n = 0; n < 14; n++) {
    const line = roadLine(rng.int(0, BLOCKS));
    const t = (rng.next() * 2 - 1) * (HALF - 10);
    if (rng.next() < 0.5) addCar(line + 3, t, 0); // road runs along Z
    else addCar(t, line - 3, Math.PI / 2); // road runs along X
  }
  // Cars must not start inside intersections or each other.
  s.vehicles = s.vehicles.filter((v, idx, all) => all.findIndex((o) => Math.hypot(o.x - v.x, o.z - v.z) < 6) === idx);

  // Cash on the roads.
  for (let n = 0; n < 60; n++) {
    const line = roadLine(rng.int(0, BLOCKS));
    const t = (rng.next() * 2 - 1) * HALF;
    const alongZ = rng.next() < 0.5;
    s.pickups.push({ id: s.nextId++, x: alongZ ? line : t, z: alongZ ? t : line, value: rng.int(5, 15) * 10, taken: false });
  }
  return s;
}

// ---- helpers ----
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Push a circle out of any building it overlaps. Returns true if it moved. */
export function resolveBuildings(buildings: Building[], p: { x: number; z: number }, r: number): boolean {
  let hit = false;
  for (const b of buildings) {
    const hw = b.w / 2, hd = b.d / 2;
    const nx = clamp(p.x, b.x - hw, b.x + hw), nz = clamp(p.z, b.z - hd, b.z + hd);
    const dx = p.x - nx, dz = p.z - nz;
    const dist = Math.hypot(dx, dz);
    if (dist >= r) continue;
    hit = true;
    if (dist > 1e-6) {
      p.x = nx + (dx / dist) * r;
      p.z = nz + (dz / dist) * r;
    } else {
      // centre is inside the box: leave through the nearest face
      const pens = [p.x - (b.x - hw), b.x + hw - p.x, p.z - (b.z - hd), b.z + hd - p.z];
      const m = Math.min(...pens);
      if (m === pens[0]) p.x = b.x - hw - r;
      else if (m === pens[1]) p.x = b.x + hw + r;
      else if (m === pens[2]) p.z = b.z - hd - r;
      else p.z = b.z + hd + r;
    }
  }
  return hit;
}

const clampWorld = (p: { x: number; z: number }) => {
  p.x = clamp(p.x, -WORLD_LIMIT, WORLD_LIMIT);
  p.z = clamp(p.z, -WORLD_LIMIT, WORLD_LIMIT);
};

export const vehicleById = (s: State, id: number | null) => s.vehicles.find((v) => v.id === id);

export const controlledVehicle = (s: State): Vehicle | undefined =>
  s.mode === 'driving' ? vehicleById(s, s.vehicleId) : undefined;

/** The nearest free vehicle within ENTER_RANGE of the player, if any. */
export function nearestEnterable(s: State): Vehicle | undefined {
  if (s.mode !== 'foot') return undefined;
  let best: Vehicle | undefined, bestD = ENTER_RANGE;
  for (const v of s.vehicles) {
    if (v.occupied) continue;
    const d = Math.hypot(v.x - s.player.x, v.z - s.player.z);
    if (d < bestD) { best = v; bestD = d; }
  }
  return best;
}

/** Enter the nearest car, or leave the current one. Returns true if the mode changed. */
export function interact(s: State): boolean {
  if (s.mode === 'foot') {
    const v = nearestEnterable(s);
    if (!v) return false;
    v.occupied = true;
    s.vehicleId = v.id;
    s.mode = 'driving';
    s.player.x = v.x; s.player.z = v.z; s.player.heading = v.heading;
    return true;
  }
  const v = controlledVehicle(s);
  if (!v) return false;
  if (Math.abs(v.speed) > MAX_EXIT_SPEED) return false; // too fast to bail out
  const rx = Math.cos(v.heading), rz = -Math.sin(v.heading);
  // Prefer the driver's (left) side, fall back to the right side if a building is in the way.
  for (const side of [-1, 1]) {
    const p = { x: v.x + rx * side * 2.4, z: v.z + rz * side * 2.4 };
    const probe = { ...p };
    if (!resolveBuildings(s.buildings, probe, PLAYER_RADIUS)) {
      s.player = { x: p.x, z: p.z, heading: v.heading };
      break;
    }
    s.player = { x: probe.x, z: probe.z, heading: v.heading };
  }
  v.occupied = false;
  s.vehicleId = null;
  s.mode = 'foot';
  return true;
}

/** Position of whatever the player currently controls (player or car). */
export function focus(s: State): Mover {
  return controlledVehicle(s) ?? s.player;
}

// ---- simulation ----
function stepVehicle(s: State, v: Vehicle, dt: number, c: Controls): void {
  if (v.occupied) {
    const t = c.throttle;
    if (t > 0) v.speed += (v.speed < 0 ? BRAKE : ACCEL) * t * dt;
    else if (t < 0) v.speed -= (v.speed > 0 ? BRAKE : REVERSE_ACCEL) * -t * dt;
    else v.speed -= Math.sign(v.speed) * Math.min(Math.abs(v.speed), 4 * dt); // rolling friction
    if (c.handbrake) v.speed -= Math.sign(v.speed) * Math.min(Math.abs(v.speed), HANDBRAKE * dt);
    const grip = clamp(v.speed / 6, -1, 1);
    v.heading += c.steer * TURN_RATE * grip * (1 - 0.35 * Math.abs(v.speed) / MAX_SPEED) * dt;
  } else {
    v.speed -= Math.sign(v.speed) * Math.min(Math.abs(v.speed), 14 * dt); // parked: brakes on
  }
  v.speed = clamp(v.speed - v.speed * 0.12 * dt, -MAX_REVERSE, MAX_SPEED);
  v.x += Math.sin(v.heading) * v.speed * dt;
  v.z += Math.cos(v.heading) * v.speed * dt;

  if (resolveBuildings(s.buildings, v, CAR_RADIUS)) {
    if (Math.abs(v.speed) > 6 && v.occupied) s.crashes++;
    v.speed *= -0.25;
  }
  for (const o of s.vehicles) {
    if (o === v) continue;
    const dx = v.x - o.x, dz = v.z - o.z;
    const dist = Math.hypot(dx, dz), min = CAR_RADIUS * 2;
    if (dist < min && dist > 1e-6) {
      const push = (min - dist) / 2;
      v.x += (dx / dist) * push; v.z += (dz / dist) * push;
      o.x -= (dx / dist) * push; o.z -= (dz / dist) * push;
      v.speed *= 0.6;
    }
  }
  clampWorld(v);
}

export function step(s: State, dt: number, c: Controls = NO_CONTROLS): void {
  dt = Math.min(dt, 0.05);
  s.time += dt;

  for (const v of s.vehicles) stepVehicle(s, v, dt, v.id === s.vehicleId ? c : NO_CONTROLS);

  const p = s.player;
  if (s.mode === 'foot') {
    p.heading += c.steer * FOOT_TURN * dt;
    const speed = c.run ? RUN_SPEED : WALK_SPEED;
    p.x += Math.sin(p.heading) * c.throttle * speed * dt;
    p.z += Math.cos(p.heading) * c.throttle * speed * dt;
    resolveBuildings(s.buildings, p, PLAYER_RADIUS);
    for (const v of s.vehicles) {
      const dx = p.x - v.x, dz = p.z - v.z, dist = Math.hypot(dx, dz), min = CAR_RADIUS + PLAYER_RADIUS - 0.4;
      if (dist < min && dist > 1e-6) { p.x = v.x + (dx / dist) * min; p.z = v.z + (dz / dist) * min; }
    }
    clampWorld(p);
  } else {
    const v = controlledVehicle(s);
    if (v) { p.x = v.x; p.z = v.z; p.heading = v.heading; }
  }

  // Cash pickups (on foot or by car).
  const f = focus(s);
  for (const k of s.pickups) {
    if (!k.taken && Math.hypot(k.x - f.x, k.z - f.z) < PICKUP_RADIUS) {
      k.taken = true;
      s.cash += k.value;
    }
  }
}
