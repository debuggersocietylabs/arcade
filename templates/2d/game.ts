import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { createOrthoCamera2D, createScene, emissiveMaterial } from '@shared/engine';
import { createInput } from '@shared/input';
import type { GameContext, GameFactory, GameInstance } from '@shared/types';
import { HEIGHT, HALF_W, createState, step } from './logic';

const SLUG = '__SLUG__';

/** 2D games use Babylon with an orthographic camera and flat meshes at z = 0. */
export const createGame: GameFactory = ({ engine, canvas, hud }: GameContext): GameInstance => {
  const scene = createScene(engine);
  new HemisphericLight('light', new Vector3(0, 0, -1), scene);
  createOrthoCamera2D(scene, HEIGHT + 2);

  const bounds = MeshBuilder.CreatePlane('bounds', { width: HALF_W * 2 + 1, height: HEIGHT + 1 }, scene);
  bounds.material = emissiveMaterial(scene, 'bounds', '#15122e');
  bounds.position.z = 0.1;
  const player = MeshBuilder.CreatePlane('player', { size: 1 }, scene);
  player.material = emissiveMaterial(scene, 'player', '#ff7ccf');
  const pickup = MeshBuilder.CreateDisc('pickup', { radius: 0.4, tessellation: 24 }, scene);
  pickup.material = emissiveMaterial(scene, 'pickup', '#ffe94a');

  const state = createState();
  hud.showOverlay({ title: SLUG, lines: ['Press Space or tap to start'] });

  const input = createInput(canvas, (cmd) => {
    if (cmd === 'action' && state.phase === 'ready') {
      state.phase = 'playing';
      hud.showOverlay(null);
    }
  });

  engine.runRenderLoop(() => {
    const move = {
      x: (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0),
      y: (input.isDown('up') ? 1 : 0) - (input.isDown('down') ? 1 : 0),
    };
    step(state, engine.getDeltaTime() / 1000, move);
    player.position.set(state.x, state.y, 0);
    pickup.position.set(state.pickup.x, state.pickup.y, 0);
    hud.setStats({ Score: state.score });
    scene.render();
  });

  return {
    dispose() {
      engine.stopRenderLoop();
      input.dispose();
      scene.dispose();
      hud.dispose();
    },
    getState: () => ({ phase: state.phase, score: state.score, x: state.x, y: state.y }),
    command(name) {
      if (name === 'start' && state.phase === 'ready') {
        state.phase = 'playing';
        hud.showOverlay(null);
      }
    },
  };
};
