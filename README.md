# CLTE WSH Safety Week 2026 Activity

A responsive, self-paced WSH Safety Week 2026 activity for staff in NP's Centre for Learning & Teaching Excellence (CLTE).

## Run locally

```bash
pnpm install
pnpm dev
```

Use `pnpm build` for a production build and `pnpm preview` to review it locally.

## Browser-local progress

Completed sections are saved in the browser's local storage so staff can continue the activity on the same device. The activity does not request a name, role, work context or personal profile. No account or backend database is used.

## Updating official information

All operational details and official URLs are centralised in `src/config.ts`.

- `emergencyNumber`: NP emergency reporting number
- `faultNumber`: hazards and defects reporting number
- `assemblyArea`: CLTE assembly destination
- `links`: WSH Portal, online fault report, emergency information, student insurance, and Haze SOP

Leave a link as an empty string to hide that action. Only complete, confirmed official destinations are shown in the interface.

## Updating scenarios

The CLTE entry point is `src/CLTESafetyApp.tsx`. Office hotspots are structured in `src/config.ts`; the Fire route checkpoints remain in the CLTE app component. Guided Injury and Haze moments live in `src/GuidedScenes.tsx`. Scenario 05 lives in `src/ReportingScene.tsx` with layout styles in `src/reporting.css`.

`src/safety.css` preserves the existing CLTE visual system. `src/guided.css` supplies the content-first layout, larger learning text, smaller illustrations and guided interaction states.

The unrelated AuditLens prototype in `src/App.tsx` and `src/styles.css` is preserved unchanged. It is not imported by the CLTE entry point. The original CLTE base was recovered from commit `d42064d`.

### Guided scenario 01

- `src/OfficeScene.tsx` and `src/office.css` provide a guided scene with five named hazards. Content and marker coordinates live in `src/config.ts`.
- Each hazard contrasts a realistic quick fix with a safer action: move a bag aside versus store it; partly close a drawer versus close it fully; unplug unfamiliar equipment versus ask for help; store heavy files overhead versus on a lower shelf; add a drink lid versus move it away. One short context sentence makes the distinction clear. Correct positions vary without randomisation. Green checks / “Correct” and warm red crosses / “Not quite — try again” accompany brief explanations. No score, drag-and-drop or object movement. All five remain freely accessible through numbered markers or names.
- Corrected image/copy mismatches: files lean on the cabinet beside the laptop, the cable hangs beside the desk, and the drink marker now points at the cup rather than the printer. The original illustration remains visible and is labelled as the starting scene.
- The files activity identifies the files as heavy before asking where to store them. Cable guidance explicitly says the equipment is unfamiliar, so staff need not guess whether unplugging it is appropriate.
- Choice progress uses `clte-office-v3`, survives revisits and is cleared by Reset activity (which also clears legacy v1/v2 keys). Earlier choices do not preselect answers in this version. Main text remains at least 18px; markers have 44px minimum tap targets. Selecting the safe action for each hazard enables Continue to Fire; unsafe choices never receive completion checks.
- `scripts/verify-office.js` checks 90 states: before selection, shortcut feedback and safer-action feedback for all five hazards at six widths. It also covers mixed answer positions, concise copy, free/sequential navigation, keyboard use, marker hit targets, correct-only progress, changing an answer, persistence/resume, reset, malformed/legacy storage and completion. Existing safe answers retain their stable IDs; replaced shortcuts receive new IDs so old selections cannot silently choose new actions.

### Illustrated decisions: scenarios 03, 04 and 05

- `src/DecisionJourney.tsx` and `src/journey.css` provide a full-scene illustration, one concise situation, two choices and brief feedback. Data lives in `src/journeyData.ts`; the existing scene exports are lightweight wrappers. Desktop imagery fills the scene; phones show a full-width illustration above the panel.
- **Injury:** check before moving someone, keep others clear, and ask directly for first-aid support.
- **Haze:** change the outdoor plan, choose cleaner indoor air rather than a covered walkway, and call 995 for breathing difficulty. No PSI-number quiz or campus-location guessing.
- **Reporting:** distinguish urgent help from a form, an injury from a fault-only report, a near miss from “nothing happened”, and an unused defective chair from a near miss. All four use relevant illustrations.
- Every situation is freely accessible. Correct choices earn completion checks; incorrect choices explain the distinction and can be changed immediately. Answer positions vary but are not shuffled. No timer, score, movement puzzle, scripted-call button or passive stamp/reveal task.
- Longer guidance is available in a closed **Quick reference**. Emergency reminders remain visible. Practice actions do not make calls or send reports. Report-practice fields remain blank and their hints are now opt-in.
- Progress uses `clte-decisions-v1-injury`, `clte-decisions-v1-haze` and `clte-decisions-v1-reporting`. Prior passive completion is not treated as an answer. Reset clears these and legacy per-scene keys; existing overall progress is preserved.
- Main situation, choice and feedback text stays at least 18px. New scenes use no decorative movement; keyboard/touch and enlarged text are supported.

`scripts/verify-journeys.js` replaces the older passive `verify-guided.js` and `verify-reporting.js` checks. Run it in a dedicated Playwright CLI session:

```bash
npx --yes --package @playwright/cli playwright-cli -s=clte-redesign open http://127.0.0.1:5173/
npx --yes --package @playwright/cli playwright-cli -s=clte-redesign run-code --filename scripts/verify-journeys.js
```

The script resets only test-browser progress. It covers all ten decisions and both options, four loaded illustrations, full-width imagery, keyboard use, concise-copy budgets, reference panels, correct-only progress, resume/reset, malformed/legacy storage and hand-off to blank report practice. Existing illustration prompts remain documented in [the asset manifest](output/imagegen/scenario-05-prompts.md).

### ERC feedback refinements

- Scenario 02 uses `src/fire.css` for a full-width route-photo canvas. On desktop, location text and a compact decision panel sit over the photo; thumbnails belong with the scene, not inside the question. On phones/tablets, a full-width photo stage leads into the readable decision panel. Content grows naturally without inner scrollboxes or fixed-height text.
- Fine-pointer desktops have gentle photo-only parallax (up to 9px horizontally / 6px vertically, with a slight tilt). Text/buttons stay still. Touch devices, smaller screens and reduced-motion settings disable the depth movement. Actual route photos, checkpoint decisions and safety guidance are unchanged.
- `scripts/verify-fire-immersive.js` checks all 14 photos, all three choices at seven checkpoints, gallery keyboard use, full-width imagery, non-overlapping panels, completion, route map, mobile/enlarged text and parallax/reduced-motion behaviour.
- Block 56 is a **stay-on-the-walkway checkpoint, not a crossing** (corrected following the route-owner feedback). The title, photo overlay, alt text, choices and feedback all state not to cross here. The later Admin Field approach remains a separate checkpoint.
- The report practice component is `src/PracticeReport.tsx`. All answers and fields start blank. The case is shown as a reference; example location and wording fill only the requested field after an explicit tap. No photo is marked as attached.
- All practice steps can be revisited. A blank review identifies missing details without claiming success. A filled practice report leads to contacts, then **Finish activity → Activity complete**.
- The completion screen's primary action is **Back to home**. **Review contacts** is optional and offers **Back to completion**. **Review activity** on the home screen returns to the completed summary.
- `scripts/verify-erc-refinements.js` covers the Block 56 cue, blank practice state, opt-in examples, review and complete finish/review navigation at desktop and phone widths.

Hotspot `x` and `y` values are percentages relative to the scene image. Operational text is kept out of the generated art and remains accessible HTML.

### Reading layout

`src/reading.css` is the shared typography/layout layer after the legacy scene styles and `guided.css`. Instructions and feedback start at 18–19px, with responsive headings, consistent reading widths and full-height wrapping controls. Tablet layouts collapse before the text columns become cramped. No learning text is line-clamped or ellipsized.

Short home and chapter-heading phrases stay together. `src/ReadingText.tsx` keeps the final two words of selected learning paragraphs together, while allowing the group to reflow if enlarged text needs more space. Contact numbers remain unbroken. Completion places Back to home immediately after the finish message.

Run `scripts/verify-reading-layout.js` through Playwright CLI in a dedicated test browser. It exercises every screen at 1440, 1024, 768, 390 and 320 CSS pixels, plus 125% text at 640 and 390 pixels; checks body-text size, control clipping, overflow and phrase wrapping; and captures `output/playwright/layout-*.png`. The script resets only that browser's CLTE progress.

`src/workspace.css` supplies responsive sizing. Above 1440px, typography scales with the viewport and the main workspace grows up to 96rem. Paragraphs retain readable line lengths, and short activities are vertically balanced on tall desktop windows without stretching their panels. Scenario-specific styles load afterwards; Fire deliberately uses full-canvas photos in `src/fire.css`. Smaller screens retain stacked content. The hazard screen opens the first risk without selecting an answer or awarding progress; all markers remain available in any order.

`scripts/verify-workspace.js` checks 209 states over 11 viewport sizes from 320px to 3778px, including 1920/2560px monitors. It asserts usable workspace width, heading-to-content spacing, image/content proportions, minimum text size, overflow, and control clipping. Screenshot evidence is under `output/playwright/spacing-*.png`.

## Replacing illustrations

Replace the WebP files in `public/assets/` while keeping the filenames:

- `office.webp`
- `walkway.webp`
- `evacuation.webp`
- `response.webp`

Recommended crop: 16:9, at least 1600 px wide. Recheck hotspot positions after replacing the office image.

## Source verification

Content was checked against:

- `CLTE WSH Staff briefing_29July.pdf`
- `CLTE WSH team meet_July26.pdf`

Confirmed from the supplied materials: Block 27 is allocated to Zone A at Admin Field; 6460 6999 for campus emergencies; prompt injury reporting via WSH Portal; 6460 6000 / online fault reporting for hazards and defects; CLTE emergency roles; Rest & Recovery locations; and the 27 April wet-weather incident near Block 73.

The supplied campus accident SOP adds the serious-medical-injury sequence: call 995 immediately, give the exact location, then inform the NP Guard Post at 6460 6999 so security can guide the ambulance. For student cases, SAS at 6460 6777 coordinates with the relevant School/Division and follows up. The mock report uses the supplied WSH Portal form as a structural reference, but reveals only three practice steps and never asks for names or contact details.

Still requiring official confirmation or full URLs: WSH Portal, emergency-information page, Student Insurance page, Haze SOP, and any building-specific evacuation routes. No route from a CLTE building has been invented in this prototype.

For the August 2026 guided redesign, general emergency and haze learning cues were checked against [SCDF Emergency Medical Services](https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services), [MOH haze advice](https://www.moh.gov.sg/others/haze/) and [NEA haze information](https://www.haze.gov.sg/). Campus contact numbers remain sourced from the supplied project materials; no unconfirmed campus destination is required by the new Haze activity.

## Privacy and accessibility

There is no backend, submission, authentication or analytics. Section progress and scenario choices are stored locally in the browser. Hotspots and activities work with keyboard/touch, controls have visible focus states, and ambient motion respects `prefers-reduced-motion`.

## Illustration generation

The four raster scenes were generated with the built-in image-generation tool using an `illustration-story` prompt set. The final prompt direction specified flat editorial artwork, simplified geometric people, drawn contours, screenprint-style grain, restrained navy/teal/amber/coral colour blocks, and explicit avoidance of photorealism, photographic lighting, text, logos and UI elements.
