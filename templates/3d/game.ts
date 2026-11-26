import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { createScene, emissiveMaterial } from '@shared/engine';
import { createInput } from '@shared/input';
import type { GameContext, GameFactory, GameInstance } from '@shared/types';
import { ARENA, createState, step } from './logic';

const SLUG = '__SLUG__';

export const createGame: GameFactory = ({ engine, canvas, hud }: GameContext): GameInstance => {
  const scene = createScene(engine);
  new HemisphericLight('light', new Vector3(0, 1, 0), scene);

  const camera = new UniversalCamera('cam', new Vector3(0, 14, -14), scene);
  camera.setTarget(Vector3.Zero());

  const floor = MeshBuilder.CreateGround('floor', { width: ARENA * 2 + 2, height: ARENA * 2 + 2 }, scene);
  floor.material = emissiveMaterial(scene, 'floor', '#15122e');
  const player = MeshBuilder.CreateBox('player', { size: 1 }, scene);
  player.material = emissiveMaterial(scene, 'player', '#7c5cff');

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
      z: (input.isDown('up') ? 1 : 0) - (input.isDown('down') ? 1 : 0),
    };
    step(state, engine.getDeltaTime() / 1000, move);
    player.position.set(state.x, 0.5, state.z);
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
    getState: () => ({ ...state }),
    command(name) {
      if (name === 'start' && state.phase === 'ready') {
        state.phase = 'playing';
        hud.showOverlay(null);
      }
    },
  };
};
