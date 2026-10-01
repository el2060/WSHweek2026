# Cubicle and Experiment Room refinement

Created with the built-in image-generation tool on 1 October 2026.

Assets:
- `public/assets/clte-cubicle-hazards.png`
- `public/assets/experiment-room/training-illustrated-v4.png`

## Prompt set

Cubicles — illustration-story: create a wide educational practice scene using the pantry image as the style reference and the supplied CLTE photographs as architectural references. Match warm detailed painted architecture and hand-drawn adult characters with natural proportions, fine outlines and restrained shading. Show oak cubicle partitions, teal cabinets, grey striped carpet, cream pillars and ceiling lights from a three-quarter perspective. Include a low laptop and hunched worker, screen glare, heavy overhead binders and someone reaching from a wheeled chair. Keep the remaining office orderly; omit spills, trailing cables, bags, labels, UI, logos and watermarks. This is a fictional practice scene, not a claim about the photographed office.

Experiment Room — style-transfer: preserve the existing room perspective, tables and layout while replacing all clay-like 3D people with hand-drawn adult colleagues matching the pantry. Apply the same warm illustrated finish to the room. Retain the damaged cable, shared power strip and detached caster on the empty foreground chair. Remove the spilled liquid and fallen bottle. No labels, UI or watermarks.

Hotspots were placed after inspecting the final artwork. The cubicle files appeared on a cabinet top, so the learning copy uses that location. The power-strip decision explicitly supplies the overloading condition: occupied sockets alone do not establish overload.

## Verification

- Production build and TypeScript compilation passed.
- Browser walkthrough: four cubicle decisions, correct and incorrect feedback, revisiting, finish, and completion retained after reload.
- Narrow and wide layouts checked, without horizontal page overflow.
- Experiment Room image and hotspot coordinate planes aligned without cropping; reviewed revised scene in browser.
- New scenario is included in navigation, completion totals, local progress and reset.
