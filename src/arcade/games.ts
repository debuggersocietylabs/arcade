import type { GameManifest } from '@shared/types';

/**
 * Games register themselves by existing: every games/<slug>/game.json is picked up at build time.
 * Nothing to edit here when adding a game.
 */
const modules = import.meta.glob<GameManifest>('/games/[!_]*/game.json', { eager: true, import: 'default' });

export function loadGames(): GameManifest[] {
  return Object.values(modules).sort(
    (a, b) => (a.status === b.status ? 0 : a.status === 'playable' ? -1 : 1) || b.added.localeCompare(a.added),
  );
}
