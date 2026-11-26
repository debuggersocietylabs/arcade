import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Every folder in games/ that has an index.html is built as its own page at
 * /games/<slug>/. Folders starting with "_" are ignored. No registration needed.
 */
function discoverGameEntries(): Record<string, string> {
  const gamesDir = resolve(root, 'games');
  const entries: Record<string, string> = {};
  for (const dirent of readdirSync(gamesDir, { withFileTypes: true })) {
    if (!dirent.isDirectory() || dirent.name.startsWith('_')) continue;
    const html = resolve(gamesDir, dirent.name, 'index.html');
    if (existsSync(html)) entries[`games/${dirent.name}`] = html;
  }
  return entries;
}

export default defineConfig({
  // Relative base: works on https://<org>.github.io/<repo>/ and on a custom domain.
  base: './',
  resolve: { alias: { '@shared': resolve(root, 'src/shared') } },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 6000,
    // Never inline models as data URLs; the loader works best with real files.
    assetsInlineLimit: (file) => (file.endsWith('.glb') ? false : undefined),
    rollupOptions: {
      input: { main: resolve(root, 'index.html'), ...discoverGameEntries() },
      // No manualChunks: automatic splitting shares common Babylon code between games without making
      // every game download what only one of them uses (e.g. the glTF loader and PBR materials).
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'games/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
