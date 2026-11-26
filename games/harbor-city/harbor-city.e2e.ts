import { expect, test } from '@playwright/test';

type S = { mode: string; x: number; z: number; speed: number; canEnter: boolean };
const state = (page: import('@playwright/test').Page) =>
  page.evaluate(() => window.__arcade!.game!.getState!() as S);

test('harbor-city: walk, enter a car, drive, exit', async ({ page }) => {
  await page.goto('/games/harbor-city/?seed=1');
  await page.waitForFunction(() => window.__arcade?.ready === true);

  let s = await state(page);
  expect(s.mode).toBe('foot');
  expect(s.canEnter).toBe(true); // a car is parked next to the spawn point

  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await state(page)).mode).toBe('driving');

  await page.keyboard.down('ArrowUp');
  await expect.poll(async () => (await state(page)).speed, { timeout: 10_000 }).toBeGreaterThan(6);
  await page.keyboard.up('ArrowUp');
  expect((await state(page)).z).toBeGreaterThan(3);

  // Brake to a stop, then step out.
  await page.keyboard.down('Space');
  await expect.poll(async () => Math.abs((await state(page)).speed), { timeout: 10_000 }).toBeLessThan(1);
  await page.keyboard.up('Space');
  expect((await state(page)).mode).toBe('driving'); // handbrake must not eject the driver
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await state(page)).mode).toBe('foot');
  expect(await page.evaluate(() => window.__arcade!.errors)).toEqual([]);
});
