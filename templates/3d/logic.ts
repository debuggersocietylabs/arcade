/**
 * Pure game logic: no Babylon, no DOM. Keep ALL rules here so they can be unit tested.
 * game.ts only renders this state and forwards input to it.
 */
export type Phase = 'ready' | 'playing' | 'over';

export interface State {
  phase: Phase;
  time: number;
  x: number;
  z: number;
  score: number;
}

export const ARENA = 8; // half-size of the square arena
export const SPEED = 6;

export const createState = (): State => ({ phase: 'ready', time: 0, x: 0, z: 0, score: 0 });

export interface Move { x: number; z: number } // each -1..1

export function step(s: State, dt: number, move: Move): void {
  if (s.phase !== 'playing') return;
  dt = Math.min(dt, 0.05);
  s.time += dt;
  s.x = Math.max(-ARENA, Math.min(ARENA, s.x + move.x * SPEED * dt));
  s.z = Math.max(-ARENA, Math.min(ARENA, s.z + move.z * SPEED * dt));
  s.score = Math.floor(s.time * 10);
}
