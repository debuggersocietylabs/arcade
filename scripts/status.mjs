#!/usr/bin/env node
// Orientation for humans and agents: npm run status
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

console.log('=== GAMES ===');
const gamesDir = join(root, 'games');
const rows = readdirSync(gamesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => {
    const manifest = JSON.parse(read(join(gamesDir, d.name, 'game.json')) || '{}');
    const notes = read(join(gamesDir, d.name, 'NOTES.md'));
    const next = /## Next steps[^\n]*\n+([\s\S]*?)(\n## |$)/.exec(notes)?.[1]?.trim().split('\n')[0] ?? '(no NOTES.md next steps)';
    return `${d.name.padEnd(22)} ${String(manifest.type).padEnd(3)} ${String(manifest.status).padEnd(9)} added ${manifest.added}\n   next: ${next}`;
  });
console.log(rows.join('\n') || '(none)');

console.log('\n=== OPEN BACKLOG ===');
const open = read(join(root, 'progress', 'BACKLOG.md')).split('\n').filter((l) => /^\s*- \[ \]/.test(l));
console.log(open.join('\n') || '(empty: invent something new)');

console.log('\n=== RECENT SESSIONS ===');
const logDir = join(root, 'progress', 'log');
const logs = existsSync(logDir) ? readdirSync(logDir).filter((f) => f.endsWith('.md')).sort().slice(-5) : [];
for (const f of logs) {
  const first = read(join(logDir, f)).split('\n').find((l) => l.startsWith('# ')) ?? f;
  console.log(`${f}: ${first.replace(/^# /, '')}`);
}
if (!logs.length) console.log('(no sessions logged yet)');
