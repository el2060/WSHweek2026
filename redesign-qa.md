# CLTE guided scenario redesign — 26 August 2026

## Design decisions

Visual thesis: a calm, content-first learning space with warm paper surfaces, teal actions, comfortable type and compact supporting scenes.

Content plan: short situation, three openly accessible moments, one clear action, immediate takeaway, then continuation. Keep serious-symptom guidance visible without making it another question.

Interaction thesis: a conversational check-in, a keep-clear marker that appears in the scene, and a colleague token that moves indoors. Short feedback reveals support learning; all new motion respects reduced-motion preferences.

03 no longer contains the exact-order action puzzle. 04 no longer contains multi-select grading, campus-location guessing or answer-gated steps. Both activity-plan choices in 04 are accepted. Practising all three moments enables scenario completion; moments and global navigation remain accessible throughout.

The main learning panels occupy roughly 70% of the guided workspace. Body instructions and takeaways are 18–20px. Mobile scenes become small context thumbnails. Fire retains its seven decisions, route photos and map, with a larger content panel and smaller supporting photo. Hazards and reporting also receive larger text and reduced visual dominance.

## Verification

- `pnpm build`: passed (TypeScript and production Vite build).
- `git diff --check`: passed.
- `scripts/verify-guided.js`: passed, no assertion failures or browser runtime errors.
- Tested widths: 1440, 1024, 768, 390 and 320 CSS pixels.
- Tested every new moment at every width; no horizontal overflow or clipped button content. Main instruction text remains at least 18px.
- Injury moments completed out of order; help was accessible before check-in or marker activation.
- Keyboard Space activates the marker; Enter moves the colleague indoors.
- Both Haze plans accepted; changing between plans does not double-count progress.
- Practice requests reveal learning feedback and do not launch a telephone link or submit a form.
- Moment progress and overall completion survive reload. Cancelled reset preserves progress; confirmed reset clears both scenarios.
- All seven Fire checkpoints, the route map and Fire completion were exercised successfully.
- Reduced-motion mode disables the colleague movement transition.
- Desktop and phone screenshots were visually reviewed.

## Screenshots

- [Injury desktop](output/playwright/injury-desktop.png)
- [Injury phone](output/playwright/injury-mobile.png)
- [Haze desktop](output/playwright/haze-desktop.png)
- [Haze phone](output/playwright/haze-mobile.png)
- [Fire desktop](output/playwright/fire-desktop.png)
- [Fire phone](output/playwright/fire-mobile.png)

## Workspace and scope

The current main entry had been replaced by an unrelated AuditLens prototype. The CLTE base was recovered from `d42064d` into `src/CLTESafetyApp.tsx` and `src/safety.css`, then updated through `src/GuidedScenes.tsx` and `src/guided.css`. AuditLens source files remain unchanged. Existing package/lockfile edits and unrelated assets were preserved.

This is a local implementation; no public deployment or real report submission was made. General health cues were checked against SCDF/NEA/MOH sources linked in the README. Campus operational details still rely on the supplied project materials, and empty official portal URLs remain hidden.

## ERC refinement verification

The route owner clarified that staff should not cross at Block 56. Corrected the checkpoint title, directions, image caption/alt text, visible photo cue, correct action and corrective feedback without drawing an invented route onto the photograph.

Report practice now opens with no selected options, no completed step markers and empty location/description/actions. Examples are opt-in per field. Review identifies missing details; it no longer automatically displays a fabricated attachment or a success message for an empty form.

Completion is a terminal summary with Back to home as the primary action. Contacts remain an optional review action with a clearly labelled return. Home's Review activity goes to the summary rather than resuming an earlier section.

Validation: production build passed; `verify-erc-refinements.js` passed at 1440px and 390px with zero failures/runtime errors. Verified the full practice → contacts → finish → completion → home → review flow, plus optional contact review. Re-ran `verify-guided.js`: all five widths and the complete seven-checkpoint Fire route passed.

Visual evidence reviewed: `output/playwright/erc-blk56-390.png`, `erc-practice-blank-390.png`, and `erc-completion-390.png`, with matching 1440px captures.
