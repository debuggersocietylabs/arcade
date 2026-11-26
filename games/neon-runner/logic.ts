import { Rng } from '@shared/rng';

/**
 * Pure game logic for Neon Runner: no Babylon, no DOM. Rendering (game.ts) only reads this state.
 * World: the player runs along +Z. Lanes are -1, 0, 1 across X. Y is up.
 */

export const LANE_WIDTH = 2.4;
export const MAX_LANE = 1;
export const GRAVITY = 38;
export const JUMP_VELOCITY = 13;
export const BASE_SPEED = 14;
export const MAX_SPEED = 32;
export const SPAWN_AHEAD = 140;
export const DESPAWN_BEHIND = 12;
export const ROW_SPACING_START = 22;
export const ROW_SPACING_MIN = 13;
export const BARRIER_HEIGHT = 0.9;
export const COIN_VALUE = 10;
/** Lateral speed (units/s) when changing lanes. */
export const LANE_SPEED = 30;

export type EntityKind = 'wall' | 'barrier' | 'coin';
export interface Entity {
  id: number;
  kind: EntityKind;
  lane: number;
  z: number;
}

export type Phase = 'ready' | 'playing' | 'dead';
export type Command = 'left' | 'right' | 'jump' | 'start';

export interface State {
  phase: Phase;
  rng: Rng;
  time: number;
  /** Distance travelled == player z. */
  z: number;
  speed: number;
  lane: number;
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  coins: number;
  entities: Entity[];
  nextRowZ: number;
  nextId: number;
}

export function createState(seed = 1): State {
  return {
    phase: 'ready', rng: new Rng(seed), time: 0, z: 0, speed: BASE_SPEED,
    lane: 0, x: 0, y: 0, vy: 0, grounded: true, coins: 0,
    entities: [], nextRowZ: 40, nextId: 1,
  };
}

export const score = (s: State): number => Math.floor(s.z / 2) + s.coins * COIN_VALUE;

export function speedAt(z: number): number {
  return Math.min(MAX_SPEED, BASE_SPEED + z * 0.006);
}

export function rowSpacingAt(z: number): number {
  return Math.max(ROW_SPACING_MIN, ROW_SPACING_START - z * 0.006);
}

/** Apply a discrete input command. */
export function dispatch(s: State, cmd: Command): void {
  if (cmd === 'start') {
    if (s.phase === 'ready') s.phase = 'playing';
    return;
  }
  if (s.phase !== 'playing') return;
  if (cmd === 'left') s.lane = Math.max(-MAX_LANE, s.lane - 1);
  else if (cmd === 'right') s.lane = Math.min(MAX_LANE, s.lane + 1);
  else if (cmd === 'jump' && s.grounded) {
    s.vy = JUMP_VELOCITY;
    s.grounded = false;
  }
}

/** Spawn rows of obstacles until the world is populated SPAWN_AHEAD in front of the player. */
function spawnRows(s: State): void {
  while (s.nextRowZ < s.z + SPAWN_AHEAD) {
    const z = s.nextRowZ;
    const roll = s.rng.next();
    const add = (kind: EntityKind, lane: number, dz = 0) =>
      s.entities.push({ id: s.nextId++, kind, lane, z: z + dz });

    if (roll < 0.35) {
      // Walls in the two lanes beside a free lane (never all three), sometimes with coins in the free lane.
      const free = s.rng.int(-1, 1);
      for (const lane of [-1, 0, 1]) if (lane !== free) add('wall', lane);
      if (s.rng.next() < 0.6) for (let i = 0; i < 3; i++) add('coin', free, -4 + i * 4);
    } else if (roll < 0.6) {
      // A low barrier across every lane: must jump.
      for (const lane of [-1, 0, 1]) add('barrier', lane);
    } else if (roll < 0.85) {
      // Coin line in a random lane.
      const lane = s.rng.int(-1, 1);
      for (let i = 0; i < 4; i++) add('coin', lane, -6 + i * 4);
    } else {
      // A single wall in one lane.
      add('wall', s.rng.int(-1, 1));
    }
    s.nextRowZ += rowSpacingAt(z);
  }
}

/** Advance the simulation by dt seconds. */
export function step(s: State, dt: number): void {
  if (s.phase !== 'playing') return;
  dt = Math.min(dt, 0.05); // clamp huge frame gaps (tab switch) so nobody tunnels through walls
  s.time += dt;
  s.speed = speedAt(s.z);
  s.z += s.speed * dt;

  // Lateral movement toward the target lane.
  const targetX = s.lane * LANE_WIDTH;
  const dx = targetX - s.x;
  const move = Math.min(Math.abs(dx), LANE_SPEED * dt);
  s.x += Math.sign(dx) * move;

  // Vertical movement.
  if (!s.grounded) {
    s.vy -= GRAVITY * dt;
    s.y += s.vy * dt;
    if (s.y <= 0) {
      s.y = 0;
      s.vy = 0;
      s.grounded = true;
    }
  }

  spawnRows(s);

  // Collisions.
  for (const e of s.entities) {
    if (Math.abs(e.z - s.z) > 0.9) continue;
    if (Math.abs(e.lane * LANE_WIDTH - s.x) > 0.95) continue;
    if (e.kind === 'coin') {
      e.z = -1e9; // consumed; culled below
      s.coins++;
    } else if (e.kind === 'wall') {
      s.phase = 'dead';
    } else if (e.kind === 'barrier' && s.y < BARRIER_HEIGHT) {
      s.phase = 'dead';
    }
  }

  s.entities = s.entities.filter((e) => e.z > s.z - DESPAWN_BEHIND);
}
