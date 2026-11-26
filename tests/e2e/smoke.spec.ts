import { expect, test } from '@playwright/test';
import { readdirSync, existsSync } from 'node:fs';

/** Every game folder is smoke-tested automatically: it must boot, render frames and log no errors. */
const slugs = readdirSync('games', { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(`games/${d.name}/index.html`))
  .map((d) => d.name);

test('arcade landing page lists every game', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await expect(page.locator('a.card')).toHaveCount(slugs.length);
  for (const slug of slugs) await expect(page.locator(`a.card[href="./games/${slug}/"]`)).toBeVisible();
  expect(errors).toEqual([]);
});

for (const slug of slugs) {
  test(`game "${slug}" boots, renders and has no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    await page.goto(`/games/${slug}/`);
    await page.waitForFunction(() => window.__arcade?.ready === true, undefined, { timeout: 15_000 });
    await page.waitForFunction(() => (window.__arcade?.frames ?? 0) > 20, undefined, { timeout: 15_000 });

    // Canvas must have real size and the shell must not have captured errors.
    const box = await page.locator('#game-canvas').boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(await page.evaluate(() => window.__arcade?.errors)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('back link returns to the arcade', async ({ page }) => {
  await page.goto(`/games/${slugs[0]}/`);
  await page.locator('a.back-link').click();
  await expect(page.locator('a.card').first()).toBeVisible();
});
