/**
 * Pure game logic: no Babylon, no DOM. Keep ALL rules here so they can be unit tested.
 * World units: the playfield is HEIGHT units tall, centred on (0, 0). +X right, +Y up.
 */
import { Rng } from '@shared/rng';

export type Phase = 'ready' | 'playing' | 'over';

export const HEIGHT = 12;
export const HALF_W = 8; // playfield half-width (the camera may show more; clamp the player to this)
export const SPEED = 7;
export const PICKUP_RADIUS = 0.8;

export interface State {
  phase: Phase;
  rng: Rng;
  time: number;
  x: number;
  y: number;
  score: number;
  pickup: { x: number; y: number };
}

export function createState(seed = 1): State {
  const s: State = { phase: 'ready', rng: new Rng(seed), time: 0, x: 0, y: 0, score: 0, pickup: { x: 0, y: 0 } };
  respawnPickup(s);
  return s;
}

export function respawnPickup(s: State): void {
  s.pickup = { x: (s.rng.next() * 2 - 1) * (HALF_W - 1), y: (s.rng.next() * 2 - 1) * (HEIGHT / 2 - 1) };
}

export interface Move { x: number; y: number } // each -1..1

export function step(s: State, dt: number, move: Move): void {
  if (s.phase !== 'playing') return;
  dt = Math.min(dt, 0.05);
  s.time += dt;
  s.x = Math.max(-HALF_W, Math.min(HALF_W, s.x + move.x * SPEED * dt));
  s.y = Math.max(-HEIGHT / 2, Math.min(HEIGHT / 2, s.y + move.y * SPEED * dt));
  if (Math.hypot(s.x - s.pickup.x, s.y - s.pickup.y) < PICKUP_RADIUS) {
    s.score++;
    respawnPickup(s);
  }
}
