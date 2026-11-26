import type { Engine } from '@babylonjs/core/Engines/engine';
import type { Hud } from './hud';

/** Everything the arcade shell hands to a game. */
export interface GameContext {
  engine: Engine;
  canvas: HTMLCanvasElement;
  hud: Hud;
}

/** What a game returns so the shell can clean up and tests can inspect it. */
export interface GameInstance {
  dispose(): void;
  /** Optional: JSON-serialisable snapshot, exposed to e2e tests as window.__arcade.game.getState(). */
  getState?(): unknown;
  /** Optional: test/debug hook to send an input command, e.g. "left", "jump". */
  command?(name: string): void;
}

export type GameFactory = (ctx: GameContext) => GameInstance | Promise<GameInstance>;

/** Shape of games/<slug>/game.json. Validated by tests/unit/games.test.ts. */
export interface GameManifest {
  slug: string;
  title: string;
  description: string;
  type: '2d' | '3d';
  /** "playable" = fun and complete enough to show proudly; "wip" = shown with a WIP badge. */
  status: 'playable' | 'wip';
  controls: string;
  emoji: string;
  /** CSS colour used for the card accent. */
  color: string;
  /** ISO date (YYYY-MM-DD) the game was created. */
  added: string;
}
