// Babylon is imported by deep path for small bundles. Some features need a side-effect import to
// register themselves; if you see "X needs to be imported before as it contains a side-effect",
// add `import '@babylonjs/core/<path to X>'` here so every game gets it.
import '@babylonjs/core/Meshes/instancedMesh';
import '@babylonjs/core/Meshes/thinInstanceMesh';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Layers/effectLayerSceneComponent';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

export function createEngine(canvas: HTMLCanvasElement): Engine {
  // antialias on; adaptToDeviceRatio keeps things sharp on retina without exploding fill-rate.
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true }, true);
  const resize = () => engine.resize();
  window.addEventListener('resize', resize);
  engine.onDisposeObservable.add(() => window.removeEventListener('resize', resize));
  return engine;
}

/** A scene with a clear colour; add lights/cameras yourself. */
export function createScene(engine: Engine, clear: string | Color4 = '#07070f'): Scene {
  const scene = new Scene(engine);
  scene.clearColor = typeof clear === 'string' ? Color4.FromHexString(clear.length === 7 ? clear + 'ff' : clear) : clear;
  return scene;
}

/**
 * Orthographic camera looking down +Z at the XY plane, for 2D games.
 * World units: the visible height is `height` units; width follows the aspect ratio.
 * Put sprites (planes / discs / boxes) at z = 0. +X is right, +Y is up.
 */
export function createOrthoCamera2D(scene: Scene, height: number): FreeCamera {
  const camera = new FreeCamera('cam2d', new Vector3(0, 0, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  const engine = scene.getEngine();
  const fit = () => {
    const aspect = engine.getRenderWidth() / Math.max(1, engine.getRenderHeight());
    camera.orthoTop = height / 2;
    camera.orthoBottom = -height / 2;
    camera.orthoLeft = (-height / 2) * aspect;
    camera.orthoRight = (height / 2) * aspect;
  };
  fit();
  engine.onResizeObservable.add(fit);
  return camera;
}

/** Unlit, glowing-looking material; the go-to for the arcade's neon look. */
export function emissiveMaterial(scene: Scene, name: string, hex: string): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  const c = Color3.FromHexString(hex);
  m.diffuseColor = Color3.Black();
  m.specularColor = Color3.Black();
  m.emissiveColor = c;
  return m;
}
