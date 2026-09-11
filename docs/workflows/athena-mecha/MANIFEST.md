# Athena Mecha Character — Workflow Manifest

Public orchestration prompt: `src/pages/workflows/character-production.astro`

## Continuity contract

Adult mechanical female warrior; calm strategic face; dark cobalt braided cable hair; owl-sensor crown; ivory ceramic armor; aged bronze structure; deep navy flexible under-suit; narrow amber lights; round aegis shield with an abstract serpent-ring motif; transforming spear; left-shoulder short cape.

## Accepted artifacts

- `01_VISUAL_RESEARCH.png` → `public/generated/workflows/athena-mecha/01-visual-research.png`
- `02_DIRECTION_EXPLORATION.png` → `public/generated/workflows/athena-mecha/02-silhouette-exploration.png`
- `03_OUTFIT_VARIANTS.png` → `public/generated/workflows/athena-mecha/03a-outfit-variants.png`
- `03_PHYSIQUE_VARIANTS.png` → `public/generated/workflows/athena-mecha/03b-physique-variants.png`
- `04_FINAL_DESIGN.png` → `public/generated/workflows/athena-mecha/04-final-design.png`
- `05_ORTHOGRAPHIC_VIEWS.png` → `public/generated/workflows/athena-mecha/05-orthographic-views.png`
- `05_RIGGING_T_POSE.png` → `public/generated/workflows/athena-mecha/05-rigging-t-pose.png`
- `05_RIGGING_A_POSE_FOUR_VIEW.png` → `public/generated/workflows/athena-mecha/05-rigging-a-pose-four-view.png`
- `05_RIGGING_A_POSE_FOUR_VIEW_EQUIPPED_COLOR.png` → `public/generated/workflows/athena-mecha/05-rigging-a-pose-four-view-equipped-color.png`
- `06_WHITE_MODEL.png` → `public/generated/workflows/athena-mecha/06-white-model.png`
- `07_TRIPO_GENERATED_MODEL.glb` → `public/generated/workflows/athena-mecha/07-tripo-generated-model.glb`

Stages 01–06 were generated with the built-in image generation tool. Their production prompts are the matching stage prompts in `src/data/workflows.ts`. The user generated Stage 07 with Tripo AI from the accepted multi-view references.

## Current review gate

Stages 01–06 are accepted. Stage 07 presents the user-supplied Tripo AI GLB for final interactive review.

Stage-02 options were numbered left-to-right, top-to-bottom:

1. Lightweight spear scout
2. Balanced field commander
3. Shield-heavy guardian
4. Ceremonial strategist
5. Angular anti-armor lancer
6. Compact urban defender

Option 4 introduced heel-like feet. The user selected its overall direction, not that defect. Stage-03 prompts requested functional flat mechanical feet, but both generated sheets retain a raised heel. Correct it in the final-design stage.

### Stage-03 outfit variants, left to right

- A: minimal split ceremonial tabard
- B: layered asymmetrical command mantle
- C: segmented armored peplos
- D: compact field-ceremony coat with modular waist panels

### Stage-03 physique variants, left to right

- A: tall lean strategist
- B: balanced athletic commander
- C: compact powerful shield bearer
- D: broad heroic heavy infantry

## Stage-04 locked selection

- Direction: 04 ceremonial strategist
- Outfit: C segmented armored peplos
- Physique: B balanced athletic commander
- Rendering direction: anime cel-shaded mecha-girl; sci-fi military construction; cyberpunk palette; premium naval sci-fi anime game finish
- User attachment is a style reference only. Do not copy its pink hair, face, costume, cable tail, pose or equipment.
- Palette update: graphite black, cool white, deep navy, electric cyan, restrained hot magenta, and small aged-bronze Athena trims.
- Required correction: broad flat mechanical combat feet.

Earlier built-in image-edit requests failed at the service network layer on 2026-09-10 without producing an artifact. A built-in retry succeeded on 2026-09-11 and was saved as:

- `04_FINAL_DESIGN.png` → `public/generated/workflows/athena-mecha/04-final-design.png`

Visual inspection passed the selected outfit and physique, identity anchors, front/back construction, component close-ups and broad flat mechanical combat feet. The cape contains non-legible decorative geometry but no readable text, label or logo. This artifact was accepted when the user continued to Stage 05.

## Stage-05 generated artifacts

- `05_ORTHOGRAPHIC_VIEWS.png` → `public/generated/workflows/athena-mecha/05-orthographic-views.png`
- `05_RIGGING_T_POSE.png` → `public/generated/workflows/athena-mecha/05-rigging-t-pose.png`
- `05_RIGGING_A_POSE_FOUR_VIEW.png` → `public/generated/workflows/athena-mecha/05-rigging-a-pose-four-view.png`
- `05_RIGGING_A_POSE_FOUR_VIEW_EQUIPPED_COLOR.png` → `public/generated/workflows/athena-mecha/05-rigging-a-pose-four-view-equipped-color.png`

Visual inspection passed front/side/back character continuity, readable joints and attachment points, broad flat mechanical feet, and separate cape, braid, shield and spear components. The T-pose sheet also supplies side and back extended-arm views. Decorative cloth geometry remains non-legible and contains no readable label or logo. These artifacts were accepted when the user requested the white-model delivery.

The later A-pose supplement uses an evenly divided 2 × 2 layout ordered front, back, left and right. All four views use the same warm-white clay material, scale and neutral A-pose. Shield and spear are omitted to keep the body silhouette unobstructed.

The colored equipped A-pose supplement preserves the same grid and approved palette. Every view holds one aegis shield on the left arm and one vertical transforming spear in the right hand. The shield necessarily obscures part of the left torso and forearm, so the neutral-clay unarmed sheet remains the cleaner geometry reference.

## Stage-06 generated artifact

- `06_WHITE_MODEL.png` → `public/generated/workflows/athena-mecha/06-white-model.png`

Visual inspection passed the uniform warm-white clay material, front/back three-quarter continuity, sculpted armor seams and articulation, broad flat feet, shield front/back and grip construction, spear components, cape mount, and knee detail. No color, texture decal, text, logo, topology overlay or wireframe is present. This is a geometry-review image, not an actual mesh, topology, rig or engine asset. The artifact was accepted when the user supplied the Stage-07 Tripo AI model.

## Stage-07 imported artifact

- `07_TRIPO_GENERATED_MODEL.glb` → `public/generated/workflows/athena-mecha/07-tripo-generated-model.glb`
- Source supplied by the user: `armored knight 3d model.glb`
- Generator declared inside the GLB: `Tripo`
- SHA-256: `199E10C1E553CD3F56891E015615906D0473E5242B22E0FFDF706DAE0BF4BE05`
- File size: 61,079,112 bytes
- Static structure: glTF 2.0; one scene, node, mesh, primitive and material; three embedded JPEG textures; no skin or animation
- Geometry: 1,053,500 vertices and 5,967,267 triangle indices, equivalent to 1,989,089 triangles

The website loads this high-resolution source only after the user activates the 3D viewer. It is suitable for visual review, but it is not yet a web-optimized, rigged or engine-validated asset. The original bytes are preserved; future optimization must write a separate derivative.

The workflow is waiting for final Stage-07 3D review. Accepted earlier stages remain preserved and will not be regenerated.
