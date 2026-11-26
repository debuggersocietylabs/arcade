#!/usr/bin/env node
// Scaffold a new game: npm run new-game -- <slug> --type 3d|2d --title "My Game"
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const fail = (msg) => {
  console.error(`✖ ${msg}\nUsage: npm run new-game -- <slug> --type 3d|2d --title "Game Title"`);
  process.exit(1);
};

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail('Slug must be lowercase kebab-case, e.g. "space-miner".');
const type = flag('type', '3d');
if (!['2d', '3d'].includes(type)) fail('--type must be 2d or 3d.');
const title = flag('title', slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '));
const dest = join(root, 'games', slug);
if (existsSync(dest)) fail(`games/${slug} already exists.`);

const date = new Date().toISOString().slice(0, 10);
cpSync(join(root, 'templates', type), dest, { recursive: true });

const replaceIn = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) replaceIn(p);
    else writeFileSync(p, readFileSync(p, 'utf8').replaceAll('__SLUG__', slug).replaceAll('__TITLE__', title).replaceAll('__DATE__', date));
  }
};
replaceIn(dest);

console.log(`✔ Created games/${slug} (${type})
Next:
  1. Edit games/${slug}/game.json (description, controls, emoji, color)
  2. Build the rules in logic.ts (+ tests), rendering in game.ts
  3. Fill in games/${slug}/NOTES.md and add a progress/log entry
  4. npm run dev  →  http://localhost:5173/games/${slug}/
  5. npm run check  (typecheck + unit + build + e2e smoke) before committing`);
