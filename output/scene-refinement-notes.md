# Scene refinements — 1 October 2026

- Removed the invented pantry cupboard and its question. Four pantry decisions remain.
- All scenario images occupy their own grid area, separate from questions, feedback and navigation. Images display without cropping.
- Removed the cubicle illustration caption and simplified its alt text.
- Replaced folders with a spare desktop PC and monitor. Updated equipment-storage and reaching questions and feedback.

## Artwork

Built-in image generation was used for both edits, preserving the existing illustration style and framing.

- `public/assets/clte-pantry-hazards-v2.png`: remove the invented cupboard door, shelves and cavity; use the supplied pantry photos to show the wooden bar table, patterned tile front, knee space and stools. Preserve the spill, bag, cable and hot mug in their original locations. No additional hazards, labels or UI.
- `public/assets/clte-cubicle-hazards-v2.png`: replace upper-right folders and boxes with a desktop PC tower and monitor. The colleague on the wheeled chair reaches for the monitor. Replace minor paper stacks with closed laptops/docking equipment. Preserve the low-laptop and screen-glare scenes, architecture and character style.

## Validation

Production build and TypeScript compilation passed. Browser geometry checks found no image/question-panel intersections or horizontal page overflow across all six scenarios at 1280px before/after feedback, and at 390px with feedback. All pantry, cubicle, fire, injury and haze decisions were exercised at 390px; pantry, fire, injury and haze decisions were also exercised at 1920px. Additional tablet checks used 1024px. These are layout checks, not a validation of campus operational guidance.
