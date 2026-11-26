import { expect, test } from '@playwright/test';

const state = (page: import('@playwright/test').Page) =>
  page.evaluate(() => window.__arcade!.game!.getState!() as { phase: string; z: number; lane: number; score: number });

test('neon-runner: starts on Space, steers, and eventually crashes', async ({ page }) => {
  await page.goto('/games/neon-runner/?seed=7');
  await page.waitForFunction(() => window.__arcade?.ready === true);
  expect((await state(page)).phase).toBe('ready');

  await page.keyboard.press('Space');
  await expect.poll(async () => (await state(page)).phase).toBe('playing');

  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await state(page)).lane).toBe(-1);
  await expect.poll(async () => (await state(page)).z).toBeGreaterThan(5);

  // Standing in a lane without dodging must end the run within a reasonable time.
  await expect.poll(async () => (await state(page)).phase, { timeout: 20_000 }).toBe('dead');
  await expect(page.locator('.hud-overlay')).toContainText('CRASHED');

  // High score is persisted for the landing page.
  await page.goto('/');
  expect(await page.evaluate(() => localStorage.getItem('arcade:best:neon-runner'))).not.toBeNull();
});
