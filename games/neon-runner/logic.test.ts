import { describe, expect, it } from 'vitest';
import {
  BASE_SPEED, COIN_VALUE, LANE_WIDTH, MAX_SPEED, createState, dispatch, score, speedAt, step,
  type Entity, type State,
} from './logic';

function running(seed = 1): State {
  const s = createState(seed);
  dispatch(s, 'start');
  return s;
}
const run = (s: State, seconds: number, dt = 1 / 60) => {
  for (let t = 0; t < seconds; t += dt) step(s, dt);
};
const place = (s: State, e: Omit<Entity, 'id'>) => {
  s.entities.push({ id: 9999 + s.entities.length, ...e });
};

describe('neon-runner logic', () => {
  it('does nothing until started', () => {
    const s = createState();
    step(s, 1);
    expect(s.z).toBe(0);
    dispatch(s, 'left');
    expect(s.lane).toBe(0);
  });

  it('moves forward and speeds up, capped at MAX_SPEED', () => {
    const s = running();
    step(s, 0.016);
    expect(s.z).toBeGreaterThan(0);
    expect(speedAt(0)).toBe(BASE_SPEED);
    expect(speedAt(1e6)).toBe(MAX_SPEED);
  });

  it('clamps lane changes to the three lanes and glides x to the target', () => {
    const s = running();
    dispatch(s, 'left');
    dispatch(s, 'left');
    dispatch(s, 'left');
    expect(s.lane).toBe(-1);
    s.entities = [];
    run(s, 0.5);
    expect(s.x).toBeCloseTo(-LANE_WIDTH, 5);
  });

  it('jumps, lands, and cannot double-jump', () => {
    const s = running();
    dispatch(s, 'jump');
    const v = s.vy;
    dispatch(s, 'jump');
    expect(s.vy).toBe(v);
    step(s, 0.1);
    expect(s.y).toBeGreaterThan(0);
    s.entities = [];
    run(s, 1.5);
    expect(s.y).toBe(0);
    expect(s.grounded).toBe(true);
  });

  it('dies when hitting a wall in the same lane', () => {
    const s = running();
    s.entities = [];
    s.nextRowZ = 1e9;
    place(s, { kind: 'wall', lane: 0, z: s.z + 3 });
    run(s, 1);
    expect(s.phase).toBe('dead');
  });

  it('survives a wall in another lane', () => {
    const s = running();
    s.entities = [];
    s.nextRowZ = 1e9;
    place(s, { kind: 'wall', lane: 1, z: s.z + 3 });
    run(s, 1);
    expect(s.phase).toBe('playing');
  });

  it('can jump over a barrier but not run through it', () => {
    const hit = running();
    hit.nextRowZ = 1e9;
    hit.entities = [];
    place(hit, { kind: 'barrier', lane: 0, z: 10 });
    run(hit, 2);
    expect(hit.phase).toBe('dead');

    const jumped = running();
    jumped.nextRowZ = 1e9;
    jumped.entities = [];
    place(jumped, { kind: 'barrier', lane: 0, z: 10 });
    // Jump at the right moment: airtime ~0.68s, and at 14 u/s the barrier is ~0.7s away.
    run(jumped, 0.4);
    dispatch(jumped, 'jump');
    run(jumped, 0.6);
    expect(jumped.phase).toBe('playing');
  });

  it('collects coins and scores them', () => {
    const s = running();
    s.nextRowZ = 1e9;
    s.entities = [];
    place(s, { kind: 'coin', lane: 0, z: s.z + 2 });
    run(s, 0.5);
    expect(s.coins).toBe(1);
    expect(score(s)).toBe(Math.floor(s.z / 2) + COIN_VALUE);
  });

  it('is deterministic for a given seed', () => {
    const a = running(42), b = running(42);
    run(a, 5);
    run(b, 5);
    expect(a.entities).toEqual(b.entities);
    expect(a.z).toBe(b.z);
  });

  it('never generates a row of walls blocking all three lanes', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = running(seed);
      const rows = new Map<number, Set<number>>();
      for (let i = 0; i < 2000; i++) {
        s.phase = 'playing'; // ignore collisions: we only inspect what the generator produced
        s.lane = 0;
        step(s, 0.05);
        for (const e of s.entities) {
          if (e.kind !== 'wall') continue;
          const lanes = rows.get(e.z) ?? new Set<number>();
          lanes.add(e.lane);
          rows.set(e.z, lanes);
        }
      }
      expect(rows.size).toBeGreaterThan(5);
      for (const lanes of rows.values()) expect(lanes.size).toBeLessThan(3);
    }
  });

  it('culls entities far behind the player', () => {
    const s = running();
    run(s, 10);
    expect(s.entities.every((e) => e.z > s.z - 12.1)).toBe(true);
  });
});
