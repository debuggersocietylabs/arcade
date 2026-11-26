import { describe, expect, it } from 'vitest';
import { createState, step } from './logic';

describe('__SLUG__ logic', () => {
  it('scores when the player touches the pickup', () => {
    const s = createState(3);
    s.phase = 'playing';
    s.x = s.pickup.x;
    s.y = s.pickup.y;
    step(s, 0.016, { x: 0, y: 0 });
    expect(s.score).toBe(1);
  });

  it('is deterministic for a seed', () => {
    expect(createState(5).pickup).toEqual(createState(5).pickup);
  });
});
