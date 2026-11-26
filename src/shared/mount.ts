import { createEngine } from './engine';
import { createHud } from './hud';
import type { GameFactory, GameInstance } from './types';
import './game-page.css';

/** Debug/test surface, available as window.__arcade. */
export interface ArcadeDebug {
  ready: boolean;
  /** Rendered frame counter; e2e tests wait for this to advance. */
  frames: number;
  /** Uncaught errors and console.error messages. A healthy game keeps this empty. */
  errors: string[];
  game?: GameInstance;
}

declare global {
  interface Window {
    __arcade?: ArcadeDebug;
  }
}

/**
 * Shared page shell for every game: canvas, HUD, back link, error capture, resize and render loop.
 * Each game's main.ts is just: mountGame(createGame).
 */
export async function mountGame(factory: GameFactory): Promise<void> {
  const app = document.getElementById('app');
  if (!app) throw new Error('Missing #app element');

  const debug: ArcadeDebug = { ready: false, frames: 0, errors: [] };
  window.__arcade = debug;
  window.addEventListener('error', (e) => debug.errors.push(String(e.error ?? e.message)));
  window.addEventListener('unhandledrejection', (e) => debug.errors.push(String(e.reason)));

  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.tabIndex = 0;
  const back = document.createElement('a');
  back.className = 'back-link';
  back.href = '../../';
  back.textContent = '← Arcade';
  app.append(canvas, back);

  try {
    const engine = createEngine(canvas);
    const hud = createHud(app);
    const game = await factory({ engine, canvas, hud });
    debug.game = game;
    engine.onEndFrameObservable.add(() => debug.frames++);
    // Each game registers its own scene(s) with the engine's render loop via runRenderLoop.
    debug.ready = true;
    canvas.focus();
  } catch (err) {
    debug.errors.push(String(err));
    const msg = document.createElement('pre');
    msg.className = 'fatal';
    msg.textContent = `This game failed to start.\n${String(err)}`;
    app.append(msg);
    throw err;
  }
}
