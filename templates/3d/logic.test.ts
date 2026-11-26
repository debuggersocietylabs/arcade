import { describe, expect, it } from 'vitest';
import { ARENA, createState, step } from './logic';

describe('__SLUG__ logic', () => {
  it('does not move before the game starts', () => {
    const s = createState();
    step(s, 1, { x: 1, z: 0 });
    expect(s.x).toBe(0);
  });

  it('stays inside the arena', () => {
    const s = createState();
    s.phase = 'playing';
    for (let i = 0; i < 600; i++) step(s, 0.016, { x: 1, z: 1 });
    expect(s.x).toBe(ARENA);
    expect(s.z).toBe(ARENA);
  });
});
