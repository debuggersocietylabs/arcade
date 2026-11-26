import { getHighScore } from '@shared/storage';
import { loadGames } from './games';
import './style.css';

const root = document.getElementById('games')!;
const games = loadGames();

if (games.length === 0) {
  root.textContent = 'No games yet. Check back soon!';
}

for (const g of games) {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = `./games/${g.slug}/`;
  card.style.setProperty('--accent', g.color);

  const best = getHighScore(g.slug);
  const badges = [g.type.toUpperCase(), g.status === 'wip' ? 'WIP' : null].filter(Boolean) as string[];

  const emoji = Object.assign(document.createElement('div'), { className: 'emoji', textContent: g.emoji });
  const title = Object.assign(document.createElement('h2'), { textContent: g.title });
  const desc = Object.assign(document.createElement('p'), { className: 'desc', textContent: g.description });
  const controls = Object.assign(document.createElement('p'), { className: 'controls', textContent: g.controls });
  const meta = document.createElement('div');
  meta.className = 'meta';
  for (const b of badges) meta.append(Object.assign(document.createElement('span'), { className: `badge ${b.toLowerCase()}`, textContent: b }));
  if (best > 0) meta.append(Object.assign(document.createElement('span'), { className: 'best', textContent: `Best ${best}` }));

  card.append(emoji, title, desc, controls, meta);
  root.append(card);
}
