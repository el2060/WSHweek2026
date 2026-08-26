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

The CLTE entry point is `src/CLTESafetyApp.tsx`. Office hotspots and reporting routes are structured in `src/config.ts`; the Fire route checkpoints remain in the CLTE app component. Guided Injury and Haze moments live in `src/GuidedScenes.tsx`.

`src/safety.css` preserves the existing CLTE visual system. `src/guided.css` supplies the content-first layout, larger learning text, smaller illustrations and guided interaction states.

The unrelated AuditLens prototype in `src/App.tsx` and `src/styles.css` is preserved unchanged. It is not imported by the CLTE entry point. The original CLTE base was recovered from commit `d42064d`.

### Guided scenarios 03 and 04

- **Injury:** check in with the student, activate a keep-clear marker, and practise requesting first-aid support. No ordering puzzle.
- **Haze:** move an activity indoors or postpone it (both accepted), accompany the colleague indoors, and practise requesting emergency help when breathing becomes difficult. No multi-select test or campus-location question.
- Every moment is accessible immediately. A short takeaway follows each action. There is no score, timer, wrong answer or forced sequence.
- Trying all three moments makes the scenario continuation available. Existing top navigation remains available at all times.
- Practice requests do not call, record, submit or collect information. Scripts are prefilled examples, not reports.
- Moment progress is saved under `clte-guided-v1-injury` and `clte-guided-v1-haze`. The activity reset clears these keys as well as overall progress.
- Main instructions and feedback are 18–20px on desktop and phones. Motion respects reduced-motion preferences; all actions support keyboard and touch.

The browser verification script is `scripts/verify-guided.js`. With the local dev server running, execute it in a dedicated Playwright CLI session:

```bash
npx --yes --package @playwright/cli playwright-cli -s=clte-redesign open http://127.0.0.1:5173/
npx --yes --package @playwright/cli playwright-cli -s=clte-redesign run-code --filename scripts/verify-guided.js
```

The script resets CLTE progress only in that test browser session. It covers free-order interactions, keyboard actions, persistence, both accepted activity plans, phone layouts, reduced motion and Fire route regression checks.

### ERC feedback refinements

- Block 56 is a **stay-on-the-walkway checkpoint, not a crossing** (corrected following the route-owner feedback). The title, photo overlay, alt text, choices and feedback all state not to cross here. The later Admin Field approach remains a separate checkpoint.
- The report practice component is `src/PracticeReport.tsx`. All answers and fields start blank. The case is shown as a reference; example location and wording fill only the requested field after an explicit tap. No photo is marked as attached.
- All practice steps can be revisited. A blank review identifies missing details without claiming success. A filled practice report leads to contacts, then **Finish activity → Activity complete**.
- The completion screen's primary action is **Back to home**. **Review contacts** is optional and offers **Back to completion**. **Review activity** on the home screen returns to the completed summary.
- `scripts/verify-erc-refinements.js` covers the Block 56 cue, blank practice state, opt-in examples, review and complete finish/review navigation at desktop and phone widths.

Hotspot `x` and `y` values are percentages relative to the scene image. Operational text is kept out of the generated art and remains accessible HTML.

### Reading layout

`src/reading.css` is the final, shared typography/layout layer after the legacy scene styles and `guided.css`. Instructions and feedback use 18–19px body text, with responsive headings, consistent reading widths and full-height wrapping controls. Tablet layouts collapse before the text columns become cramped. No learning text is line-clamped or ellipsized.

Short home and chapter-heading phrases stay together. `src/ReadingText.tsx` keeps the final two words of selected learning paragraphs together, while allowing the group to reflow if enlarged text needs more space. Contact numbers remain unbroken. Completion places Back to home immediately after the finish message.

Run `scripts/verify-reading-layout.js` through Playwright CLI in a dedicated test browser. It exercises every screen at 1440, 1024, 768, 390 and 320 CSS pixels, plus 125% text at 640 and 390 pixels; checks body-text size, control clipping, overflow and phrase wrapping; and captures `output/playwright/layout-*.png`. The script resets only that browser's CLTE progress.

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

There is no backend, submission, authentication or analytics. Only section progress is stored locally in the browser. Hotspots and activities work with keyboard/touch, controls have visible focus states, and ambient motion respects `prefers-reduced-motion`.

## Illustration generation

The four raster scenes were generated with the built-in image-generation tool using an `illustration-story` prompt set. The final prompt direction specified flat editorial artwork, simplified geometric people, drawn contours, screenprint-style grain, restrained navy/teal/amber/coral colour blocks, and explicit avoidance of photorealism, photographic lighting, text, logos and UI elements.
