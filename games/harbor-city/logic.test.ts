import { describe, expect, it } from 'vitest';
import {
  BLOCKS, HALF, MAX_SPEED, WORLD_LIMIT, createState, focus, interact, nearestEnterable, resolveBuildings, step,
  type Controls, type State,
} from './logic';

const go = (s: State, seconds: number, c: Partial<Controls>, dt = 1 / 60) => {
  const controls: Controls = { throttle: 0, steer: 0, handbrake: false, run: false, ...c };
  for (let t = 0; t < seconds; t += dt) step(s, dt, controls);
};
const emptyWorld = (seed = 1) => {
  const s = createState(seed);
  s.buildings = [];
  s.pickups = [];
  return s;
};
const enterCar = (s: State) => {
  expect(interact(s)).toBe(true);
  expect(s.mode).toBe('driving');
};

describe('harbor-city world', () => {
  it('is deterministic for a seed and varies between seeds', () => {
    expect(createState(5).buildings).toEqual(createState(5).buildings);
    expect(createState(5).buildings).not.toEqual(createState(6).buildings);
  });

  it('has a populated city', () => {
    const s = createState(1);
    expect(s.buildings.length).toBeGreaterThan(BLOCKS * BLOCKS);
    expect(s.vehicles.length).toBeGreaterThan(5);
    expect(s.pickups.length).toBeGreaterThan(30);
  });

  it('never places buildings, cars or the spawn point on top of each other', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const s = createState(seed);
      expect(resolveBuildings(s.buildings, { x: 0, z: 0 }, 0.5)).toBe(false);
      for (const v of s.vehicles) expect(resolveBuildings(s.buildings, { x: v.x, z: v.z }, 1.7), `seed ${seed} car ${v.id}`).toBe(false);
    }
  });

  it('spawns a car within reach of the player on every seed', () => {
    for (let seed = 1; seed <= 25; seed++) expect(nearestEnterable(createState(seed))).toBeDefined();
  });
});

describe('on foot', () => {
  it('walks forward, turns, and runs faster', () => {
    const a = emptyWorld(), b = emptyWorld();
    go(a, 1, { throttle: 1 });
    go(b, 1, { throttle: 1, run: true });
    expect(a.player.z).toBeGreaterThan(4);
    expect(b.player.z).toBeGreaterThan(a.player.z);
    go(a, 0.5, { steer: 1 });
    expect(a.player.heading).toBeGreaterThan(0.5);
  });

  it('cannot walk through buildings or out of the world', () => {
    const s = createState(1);
    s.buildings = [{ x: 0, z: 10, w: 10, d: 4, h: 20, tint: 0 }];
    go(s, 5, { throttle: 1 });
    expect(s.player.z).toBeLessThan(8.1);
    const open = emptyWorld();
    go(open, 120, { throttle: 1 });
    expect(open.player.z).toBeLessThanOrEqual(WORLD_LIMIT);
  });
});

describe('vehicles', () => {
  it('enter and exit toggle the mode and free the car again', () => {
    const s = emptyWorld();
    const car = nearestEnterable(s)!;
    enterCar(s);
    expect(car.occupied).toBe(true);
    expect(interact(s)).toBe(true);
    expect(s.mode).toBe('foot');
    expect(car.occupied).toBe(false);
    expect(Math.hypot(s.player.x - car.x, s.player.z - car.z)).toBeGreaterThan(1.5);
  });

  it('cannot enter a car that is out of range', () => {
    const s = emptyWorld();
    s.player.x = 500;
    expect(interact(s)).toBe(false);
  });

  it('accelerates up to a top speed, steers, brakes and reverses', () => {
    const s = emptyWorld();
    enterCar(s);
    const car = focus(s);
    go(s, 1, { throttle: 1 });
    expect((car as typeof s.vehicles[number]).speed).toBeGreaterThan(8);
    go(s, 15, { throttle: 1 });
    expect((car as typeof s.vehicles[number]).speed).toBeLessThanOrEqual(MAX_SPEED);
    const h0 = car.heading;
    go(s, 0.5, { throttle: 1, steer: 1 });
    expect(car.heading).toBeGreaterThan(h0);
    go(s, 3, { handbrake: true });
    expect((car as typeof s.vehicles[number]).speed).toBeCloseTo(0, 0);
    go(s, 2, { throttle: -1 });
    expect((car as typeof s.vehicles[number]).speed).toBeLessThan(0);
  });

  it('does not turn while stationary', () => {
    const s = emptyWorld();
    enterCar(s);
    const h0 = focus(s).heading;
    go(s, 1, { steer: 1 });
    expect(focus(s).heading).toBe(h0);
  });

  it('crashes into buildings instead of driving through them', () => {
    const s = emptyWorld();
    s.buildings = [{ x: 2.5, z: 40, w: 20, d: 6, h: 20, tint: 0 }];
    enterCar(s);
    go(s, 6, { throttle: 1 });
    const car = s.vehicles.find((v) => v.id === s.vehicleId)!;
    expect(car.z).toBeLessThan(40 - 3);
    expect(s.crashes).toBeGreaterThan(0);
  });

  it('refuses to bail out at high speed', () => {
    const s = emptyWorld();
    enterCar(s);
    go(s, 3, { throttle: 1 });
    expect(interact(s)).toBe(false);
    expect(s.mode).toBe('driving');
  });

  it('keeps the driver exit point outside buildings', () => {
    const s = emptyWorld();
    enterCar(s);
    const car = s.vehicles.find((v) => v.id === s.vehicleId)!;
    s.buildings = [{ x: car.x - 4, z: car.z, w: 4, d: 10, h: 10, tint: 0 }];
    expect(interact(s)).toBe(true);
    expect(resolveBuildings(s.buildings, { x: s.player.x, z: s.player.z }, 0.49)).toBe(false);
  });

  it('keeps cars inside the world', () => {
    const s = emptyWorld();
    enterCar(s);
    go(s, 40, { throttle: 1 });
    const car = s.vehicles.find((v) => v.id === s.vehicleId)!;
    expect(Math.abs(car.z)).toBeLessThanOrEqual(WORLD_LIMIT);
    expect(HALF).toBeLessThan(WORLD_LIMIT);
  });
});

describe('pickups', () => {
  it('collects cash on foot and in a car, once each', () => {
    const s = emptyWorld();
    s.pickups = [{ id: 900, x: 0, z: 1, value: 100, taken: false }];
    step(s, 0.016);
    step(s, 0.016);
    expect(s.cash).toBe(100);
    s.pickups.push({ id: 901, x: 2.5, z: 6, value: 50, taken: false });
    enterCar(s);
    go(s, 1, { throttle: 1 });
    expect(s.cash).toBe(150);
  });
});
