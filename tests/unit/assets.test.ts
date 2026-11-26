import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

/**
 * Asset policy: third-party art must be CC0 (public domain), committed under games/<slug>/assets/,
 * recorded in that folder's LICENSES.json, and kept small. See CLAUDE.md "Assets".
 */
const MB = 1024 * 1024;
const MAX_FILE = 2 * MB;
const MAX_PER_GAME = 15 * MB;
const ALLOWED = ['.glb', '.png', '.jpg', '.jpeg', '.webp', '.env'];
const BANNED = [
  '.gltf', '.bin', '.obj', '.fbx', '.blend', '.dae', '.stl', '.hdr', '.exr', '.tga', '.psd', '.gif', '.bmp', '.ktx2',
  '.mp3', '.ogg', '.wav', '.m4a', '.flac', '.mp4', '.webm', '.ttf', '.otf', '.woff', '.woff2', '.zip',
];

interface LicenseEntry { file: string; license: string; source: string; author: string }

const walk = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))
    : [];

const repoFiles = ['games', 'src', 'public', 'templates'].flatMap(walk);
const assets = repoFiles.filter((f) => ALLOWED.includes(extname(f).toLowerCase()));

describe('asset policy', () => {
  it('has no disallowed binary file types', () => {
    expect(repoFiles.filter((f) => BANNED.includes(extname(f).toLowerCase()))).toEqual([]);
  });

  it('keeps every asset inside games/<slug>/assets/', () => {
    expect(assets.filter((f) => !/^games\/[^/]+\/assets\//.test(f))).toEqual([]);
  });

  const games = [...new Set(assets.map((f) => f.split('/')[1]!))];
  for (const game of games) {
    describe(game, () => {
      const dir = `games/${game}/assets`;
      const files = assets.filter((f) => f.startsWith(`${dir}/`));

      it('records a CC0 licence and source for every file', () => {
        const entries = JSON.parse(readFileSync(`${dir}/LICENSES.json`, 'utf8')) as LicenseEntry[];
        for (const f of files) {
          const name = relative(dir, f);
          const entry = entries.find((e) => e.file === name);
          expect(entry, `${name} is not listed in ${dir}/LICENSES.json`).toBeDefined();
          expect(entry!.license).toBe('CC0-1.0');
          expect(entry!.source).toMatch(/^https:\/\//);
          expect(entry!.author.length).toBeGreaterThan(0);
        }
        for (const e of entries) expect(existsSync(join(dir, e.file)), `${e.file} is listed but missing`).toBe(true);
      });

      it('stays within the size budget', () => {
        for (const f of files) expect(statSync(f).size, `${f} is too large`).toBeLessThanOrEqual(MAX_FILE);
        expect(files.reduce((sum, f) => sum + statSync(f).size, 0)).toBeLessThanOrEqual(MAX_PER_GAME);
      });
    });
  }
});
