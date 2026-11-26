import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { GameManifest } from '../../src/shared/types';

/** Guards the conventions that the arcade shell, CI and autonomous Claude sessions rely on. */
const dirs = readdirSync('games', { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_'));

describe('game folder conventions', () => {
  it('has at least one game', () => expect(dirs.length).toBeGreaterThan(0));

  for (const { name } of dirs) {
    describe(name, () => {
      const file = (f: string) => `games/${name}/${f}`;

      it('has the required files', () => {
        for (const f of ['index.html', 'main.ts', 'game.ts', 'logic.ts', 'logic.test.ts', 'game.json', 'NOTES.md']) {
          expect(existsSync(file(f)), `${file(f)} is missing`).toBe(true);
        }
      });

      it('has a valid game.json whose slug matches the folder', () => {
        const m = JSON.parse(readFileSync(file('game.json'), 'utf8')) as GameManifest;
        expect(m.slug).toBe(name);
        expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(m.title.length).toBeGreaterThan(1);
        expect(m.description.length).toBeGreaterThan(10);
        expect(m.description).not.toContain('TODO');
        expect(['2d', '3d']).toContain(m.type);
        expect(['playable', 'wip']).toContain(m.status);
        expect(m.controls.length).toBeGreaterThan(1);
        expect(m.emoji.length).toBeGreaterThan(0);
        expect(m.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(m.added).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it('keeps logic.ts free of rendering/DOM imports', () => {
        const src = readFileSync(file('logic.ts'), 'utf8');
        expect(src).not.toMatch(/from\s+['"]@babylonjs/);
        expect(src).not.toMatch(/\b(document|window)\./);
      });
    });
  }
});
