// glTF binary (.glb) model loading. Import this module only in games that ship models:
// the loader is a separate chunk, so other games never download it.
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import type { AssetContainer } from '@babylonjs/core/assetContainer';
import type { Scene } from '@babylonjs/core/scene';
import '@babylonjs/loaders/glTF/2.0';

/**
 * Load a model that is committed in games/<slug>/assets/. Always pass a bundled URL:
 *   import carUrl from './assets/car.glb?url';
 *   const car = await loadModel(scene, carUrl);
 *   car.addAllToScene();                          // show it once, or
 *   const copy = car.instantiateModelsToScene();  // stamp out many copies
 * Do not use Draco / Meshopt / KTX2 compressed files: Babylon fetches their decoders from a CDN.
 */
export function loadModel(scene: Scene, url: string): Promise<AssetContainer> {
  return LoadAssetContainerAsync(url, scene, { pluginExtension: '.glb' });
}
