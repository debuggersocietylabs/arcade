# Harbor City asset starter pack (all CC0; sources in LICENSES.json)

Every `.glb` is self-contained (texture embedded) and was loaded and viewed in the production build on 2026-11-26.
Only files you `import ... ?url` are shipped to players. Import example:
`import sedanUrl from './assets/vehicles/car-sedan.glb?url';` then `loadModel(scene, sedanUrl)` from `@shared/models`.

Sizes are native model units (width x height x length); **scale them to game units** (a Harbor City car is ~4.2 long).

| File | Native size | Suggested scale | Notes |
| --- | --- | --- | --- |
| vehicles/car-sedan, car-stationwagon, car-taxi, car-police | 0.42 x ~0.4 x 0.94 | ~4.5 | Front is +Z. Separate wheel nodes `car_<name>_wheel_{front,rear}_{left,right}`. min Y is -0.06: raise by 0.06 x scale. |
| vehicles/car-hatchback | 0.42 x 0.37 x 0.81 | ~4.8 | Same as above. |
| vehicles/truck | 1.5 x 1.3 x 2.8 | ~1.9 | Front is +Z. Wheel nodes `wheel-{front,back}-{left,right}`, body node `body`. |
| vehicles/motorcycle | 1.09 x 1.27 x 2.44 | ~0.9 | Nodes `wheel-front`, `wheel-back`, `body`, `fork`. |
| characters/character | 1.2 x 1.1 x 0.64 | ~1.6 | Little robot. Animation groups: `static`, `idle`, `walk`, `jump`. Appears to face +Z (verify when wiring in). |
| buildings/building-a … building-h | 1.2-2.0 wide, 1.55-2.95 tall, ~1.3-1.45 deep | ~7-9 | Colourful low-rise blocks; min Y 0.1. |
| buildings/garage | 1 x 0.55 x 1 | ~10 | Good spot for a vehicle shop. |
| nature/trees, trees-tall | ~1 x 0.7 x 1 | ~7 | A tile of grass with several trees. |
| props/streetlight (0.96 tall), trafficlight (0.73) | | ~6 | |
| props/bench, fire-hydrant, trash, dumpster, bush, box | 0.13-0.57 | ~4-5 | |
| props/water-tower, fountain | | ~8 | Landmarks. |
| props/coin | 0.42 | ~2.5 | Could replace the box-shaped cash pickups. |
| textures/{asphalt,concrete,grass,bricks,paving}-{color,normal}.jpg | 512x512, tileable | set `uScale`/`vScale` | ambientCG; normal maps are OpenGL convention. |

Performance: load each model once (`loadModel`), then instance it (`instantiateModelsToScene` or mesh instances / thin
instances). There are ~250 buildings; do not clone full meshes per building.
