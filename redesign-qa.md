# CLTE guided scenario redesign — 26 August 2026

## Scenario 02: one learning focus, all photos retained — 27 August 2026

Visual thesis: retain the immersive real-photo canvas, with a single calm cream decision surface. Content plan: route status, selectable photo views with a factual caption, then checkpoint/situation/question/choices in one panel; learning appears after the choice. Interaction thesis: keep the existing photo fade and desktop-only parallax, with stable controls and immediate feedback. The frontend skill informed separating visual orientation from the learning interaction, removing the competing left instruction block rather than reducing imagery.

All 14 original route photos and the map are unchanged. Alternate views remain visible and keyboard-selectable, not hidden in a disclosure. Reviewed all seven checkpoints: exit promptly versus collecting belongings; steady stair use versus rushing; designated route versus familiar shortcut; calling a colleague back at Block 56; crossing near Admin Field under the warden's direction when safe; keeping the approach clear; and reporting a missing colleague without re-entering. Each has two choices, mixed but stable correct-answer positions, a short situation and answer-specific feedback. No preselected answers or takeaway before a choice. Checkpoints remain freely accessible.

Block 56 retains one prominent “Do not cross here” cue inside the decision panel. It is deliberately not a route-memory test: the learner applies that instruction to a colleague heading towards the crossing. Neutral photo captions identify views without repeating instructions. The later Admin Field checkpoint teaches when to cross, with feedback distinguishing it from Block 56. Campus-route details remain based on the project's supplied route and owner correction. General evacuation wording was checked against [SCDF evacuation guidance](https://www.scdf.gov.sg/docs/default-source/fire-safety-docs/emergency-response-plan/erp-evacuation-guidelines---8-storeys-and-below.pdf?sfvrsn=8d3a4daa_1).

Verified 225 focused Fire states and 112 image loads (all 14 photos at eight viewport/text-size settings), including both choices, initial blank state, keyboard gallery use, route map, completion, 18px+ learning text, non-overlap, full-width photo geometry and parallax/reduced-motion behaviour. ERC completion/practice regressions, 546 all-page reading states and 209 responsive workspace states passed. Visually inspected desktop Block 56/Junction and the phone exit screen. Production build and diff checks passed. Captures: `output/playwright/fire-immersive-{3,4}-1440.png` and `fire-immersive-start-390.png`.

## Keep the actual hazard visible — 27 August 2026

The prior geometry check protected numbered markers but missed partial occlusion of the physical cup and printer. Visual thesis: preserve the immersive office while giving the active hazard an unobstructed viewing area. Content plan: retain the existing short situation, two choices and feedback; reposition rather than add explanation. Interaction thesis: one fixed panel position throughout the Drink question and its feedback, no animation or drag controls. The frontend skill informed placement relative to the illustration rather than treating it as decoration.

Drink now places the compact panel towards the middle-left. Its scene is right-aligned so the printer edge stays in view, with a tighter cap on image cropping to preserve the other markers too. The hazard navigation uses only its content width. Other question positions, text sizes, choices and saved progress are unchanged. The immersive regression now checks each active object's source-image region (bag, open drawer, cable, files, and cup plus printer), as well as marker targets, before and after each answer. Includes the user's 3640×1762 screenshot size.

The active Drink marker is also offset from the cup, with a thin pointer to its location; phones use an offset appropriate to their smaller image. Desktop navigation drops repeated numbers but retains named choices and completion ticks. Verified 135 object-visibility/layout states and 90 choice/progress states, with no obstructed active hazard region, cropped active object, overlapping markers or runtime errors. Production build and diff checks passed. Visually checked desktop and phone Drink before/after feedback: `output/playwright/office-drink-clear-{3640,1440,390}-{-1,0,1}.png`.

## Scenario 01 immersive composition — 27 August 2026

The previous refinement retained the older office split layout; its wide quiz panel was inconsistent with the new scene-led scenarios. Visual thesis: make the office itself the desktop workspace, with a compact cream decision surface matching Scenarios 02–05. Content plan: small scenario badge, five on-image markers, one short situation and two choices, then feedback and navigation. Interaction thesis: stable image/marker geometry and immediate answer feedback; no decorative motion or dragging. The frontend skill guided the full-canvas composition, smaller panel and removal of the oversized introduction and repeated visible prompt.

The decision panel is capped at 28rem / 34% of the desktop viewport. The image and its markers remain on one proportionally scaled plane; side cropping is limited so all five hazards remain visible. Panel-height measurement reserves enough vertical scene space for answer feedback without obscuring the printer/drink marker. Phones and tablets show the complete office image, named hazard navigation and then the decision surface. Choices, answer IDs, learning feedback, saved progress and completion rules are unchanged.

Verified 90 all-choice/progress states and 120 additional immersive-layout states, including 320px enlarged text, 1440px enlarged text and the user's 3778px desktop scale. No panel, navigation or footnote overlaps any marker after layout settles. The decision surface uses about 21% of the 3778px width, 28% at 1920px and 31% at 1440px; 18px+ learning text is retained. All-page reading (546 states) and responsive workspace (209 states) regressions also passed. Production build and diff checks passed. Desktop Cable and enlarged-phone screens were visually reviewed; narrow screens use the stacked layout by 1280px to avoid an empty band above the illustration. Phone markers retain 44px touch targets without growing into one another when text is enlarged; at 360px and below the Files marker sits slightly above its stack to separate it from Drawer. Example previews: `output/playwright/office-guided-2-1440.png`, `office-immersive-3778-1.png` and `office-immersive-320-1.25.png`.

## All-scenario immersion and concise decisions — 27 August 2026

Reviewed all five scenarios. Retained Scenario 01's meaningful two-choice hazard interactions and on-image markers, and Scenario 02's full-photo route/parallax. Replaced the passive mechanics in Injury, Haze and Reporting with a shared illustrated decision scene. Each now has one short setup, two practical options, and one immediate explanation. Removed duplicated headings/cues, both-valid plan buttons, token movement, keep-clear toggle, scripted call blocks, pre-labelled report destinations and reveal-only stamps. Report-practice hints are now optional disclosures; fields still start blank.

Visual thesis: the campus scene fills the workspace, with one compact, high-contrast decision panel. Content plan: small scenario heading, one situation/question, two choices, feedback, next and free step navigation. Interaction thesis: stable scenes and immediate selection feedback; no decorative motion or forced sequence. The frontend skill informed the image-led composition and removal of repeated UI. Reused all four relevant illustrations without generating or changing assets.

New `clte-decisions-v1-{injury,haze,reporting}` records store actual choices; prior passive completions cannot preselect new answers. Only correct choices count, but every step remains accessible. Incorrect answers persist honestly; revisits find the first unfinished decision. Reset clears both storage generations. No real calls, uploads or report submissions are introduced.

Safety wording checked against [HealthHub / MOH haze guidance](https://www.healthhub.sg/highlights-and-insights/health-safety-advisory/how-to-protect-yourself-against-haze) and [SCDF emergency medical services](https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services). The asthma case encourages prompt medical advice for symptoms, not waiting for them to persist. Breathing difficulty directs to 995 without waiting for an air-quality reading. Campus Guard Post/fault contacts and reporting channels remain as supplied in project configuration. Longer guidance and official links remain available through Quick reference.

Verified: 231 focused illustrated-decision states, 546 all-page reading states and 209 responsive workspace states, including enlarged text and widths from 320 to 3778px. Initial decision panels contain at most 39 words; feedback is capped at 28 words. Correct/incorrect choices, keyboard use, free navigation, persisted answers, legacy records, reset and continuation all passed with no runtime errors. ERC regressions passed for the Block 56 warning, blank practice answers and final completion flow. Production build and diff checks passed.

Visually reviewed desktop Injury, Haze, falling-box and chair scenes plus phone layouts. The people, fallen box and cracked chair leg remain visible beside the decision panel. Fixed mobile navigation staying open when selecting the current scenario. Changing Reporting situations on phones now brings the new illustration into view, rather than jumping past it. Final captures: `output/playwright/breezy-{injury,haze,reporting}-*-{1440,390}.png`.

## Scenario 02 immersive photo restoration — 27 August 2026

Visual thesis: the real evacuation route fills the screen, with calm, high-contrast reading surfaces layered over it. Content plan: compact route status, location/context and photo views, one decision panel, then checkpoint navigation. Interaction thesis: gentle cursor-following photo depth, a short photo fade between views, and stable text/controls. This follows the frontend skill's image-led composition while respecting the user's preference for readable choices and minimal clutter.

`src/fire.css` restores edge-to-edge photography below the fixed header, replacing the small photo / large quiz split. Thumbnails now sit beside the route context. The cream decision panel is limited to 30rem on desktop; grid flow lets feedback and enlarged text expand without overlap. Phones/tablets use a full-width photo stage followed by the decision panel and wrapped checkpoint navigation. Photo and text remain accessible; the Block 56 keep-to-walkway warning is retained prominently.

The original pointer handlers were present but later CSS set the photo transform to none. Restored a bounded desktop-only movement (±9px / ±6px, ±0.4° tilt) with overscan to prevent exposed image edges. Reduced motion and coarse/touch pointers disable the effect; controls never move. Review remaining checkpoints now also resets the photo index, preventing a previous gallery view from carrying into another checkpoint. Route wording, choices, map and learning takeaways are unchanged apart from shorter interface labels.

Verified: 281 focused Fire states, including 112 photo loads (all 14 photos across eight viewport/text-size settings), correct/incorrect responses, keyboard gallery selection, route map, completion, full-width image geometry, stable panels during parallax and reduced-motion/mobile stillness. Also passed 462 all-page reading states and 209 workspace states. Fixed an enlarged-text “Approach” label overflow with content-sized wrapping navigation; the last phone row fills its available width. Removed the Fire page-entry slide so only its photo moves. Production build passed. Final previews: `output/playwright/fire-immersive-start-1440.png` and `fire-immersive-start-390.png`; Block 56 and roll-call captures are alongside them.

## Everyday shortcuts versus safer actions — latest refinement

The user found the literal “fix it / leave it” choices too obvious. All five hazards now offer a plausible shortcut and a safer action, with one short context cue: the bag owner returns soon; another file is needed shortly; the cable’s equipment is unfamiliar; the files are heavy; the drink is beside an ongoing print job. Each feedback explains the overlooked risk, not just whether the answer is right. The safer answer appears first for Bag/Files and second for Drawer/Cable/Drink, with stable ordering and no randomisation.

Design thesis: retain the calm, warm office workspace and large text. Content plan: one context sentence, two brief actions, one takeaway, then Next. Interaction thesis: retain static check/cross and immediate feedback; add no motion, dragging or extra panels, as requested. The frontend skill informed restraint and scan-friendly wording rather than a visual overhaul. Wrong-choice feedback is gently labelled “Not quite — try again”.

Completion and free navigation are unchanged. Existing safe-answer IDs remain valid; replaced shortcut IDs do not inherit old selections. No reset of overall scenario progress.

Verified all five questions and both options: 90 focused hazard states, 462 all-page reading states (including enlarged text), and 209 responsive workspace states passed, with no runtime errors, clipping or flagged widows. Production build and diff checks passed. Visually reviewed the updated desktop Drawer/Files and phone Cable/Drink feedback screens; the existing large-text layout accommodates the new wording without extra UI.

## Clear safe / unsafe choices — previous refinement

Scenario 01 now has one clearly safe action and one clearly unsafe action per hazard, as requested. Replaced unfamiliar labels such as “storage cubby”, “sturdy bag hook” and “choose a secure home” with concrete actions: put the bag in a cupboard, close the drawer, ask for the cable to be secured, put files inside a cupboard, and move the drink away from the printer. Removed “Both options work here”.

Selected safe answers show a green check and “Correct”. Selected unsafe answers show a warm red cross and “Not safe — choose again”. One short feedback paragraph explains the risk or useful takeaway; there is no movement or extra instruction panel. The frontend skill guided keeping the existing content-first layout and large text, rather than adding decorative choice cards.

Only safe choices receive completion checks. Wrong answers remain editable and persist honestly; revisiting resumes at the first unfinished hazard. All hazards remain accessible in any order. New `clte-office-v3` storage avoids treating old two-safe-option selections as answers; reset clears v1/v2/v3. Existing overall scenario completion is preserved.

Verified: production build; 90 focused hazard states across six widths; 462 all-page reading states including enlarged text; 209 responsive workspace states. No runtime errors, text clipping or flagged widows. Visually reviewed desktop unsafe feedback (`output/playwright/office-incorrect-1440.png`) and phone safe feedback (`output/playwright/office-guided-0-390.png`). Keyboard selection, correct-only progress, wrong-answer persistence/resume, legacy state, reset and continuation passed.

## Concise choices and feedback — previous refinement

Following the user's final clarification, Scenario 01 is deliberately simple: a short situation, two plain text choices and a single feedback paragraph. There is no drag/drop, object movement, extra illustration, scoring or retry loop. Both choices are safe alternatives, with feedback that changes according to the selected action. The existing office image and named markers remain. The frontend skill's content hierarchy guided removal of the repeated green instruction panel, duplicate outcome headings, long captions and verbose setup copy; font sizes were not reduced.

The new `clte-office-v2` state stores the actual selection for each hazard. Old v1 completion-only records are not treated as answers. Reset clears both keys; overall completed-scenario progress remains unchanged.

Trimmed repeated navigation notes, context slogans and practice labels in Injury/Haze. Reporting no longer repeats story details in image captions, repeats the practice disclaimer beside the action, or adds a task label that duplicates its button. Kept distinct classification cues, real emergency instructions, campus numbers and report-practice hints.

Updated verification checks both choices, distinct feedback (at most 26 words), no preselected answers, no drag controls or redundant hazard cue panel, and a 65-word ceiling on the initial hazard panel. Visual evidence: `output/playwright/office-concise-cable-before-1440.png` and `office-concise-cable-before-390.png`, plus the per-hazard feedback captures.

Passed: 90 focused hazard states, 462 all-page reading states (including enlarged text; no flagged widows), 209 widescreen states, Injury/Haze regression and 48 Reporting states. Production build and diff checks passed. Final visual review removed the green hover fill so an unchosen answer cannot look preselected on touch screens.

## Scenario 01 and all-scenario clarity review

The frontend design direction remains a warm, content-first workspace: one office scene, named hazards, one action per hazard, then the reason it helps. Small marker-to-check and feedback-reveal transitions show progress; reduced motion removes the animation. Reused the existing scene, with corrected coordinates and copy, rather than adding decorative imagery.

Replaced all five three-option quizzes with guided practice. The files example no longer grades “straighten the stack” against “store heavy files lower”; it identifies files leaning at the cabinet edge and lets staff practise secure shelf storage. Each hazard provides a concise, reusable takeaway. Cable practice asks for support rather than requiring staff to unplug equipment. Numbered markers, a named hazard row, next/back controls and persisted progress make completion straightforward. The illustration is explicitly labelled as the starting scene, since it does not depict the post-action changes.

Reviewed all five scenarios and the report practice. Kept Fire’s established flow, clarified the stair/walkway/assembly cues, distinguished the Admin Field crossing from Block 56, and replaced generic feedback headings with “Why this helps” / “A safer next step”. Strengthened the reasons for using the handrail, keeping approaches clear and staying for roll call. Injury already has explicit care/keep-clear/help cues; retained these. Made Haze action headings more direct. Scenario 05 already uses concrete situations and guided actions; retained it. Added brief case-based hints beside the blank report-practice choices, without preselecting any answers.

General housekeeping and cable principles checked against [HSE trip prevention](https://www.hse.gov.uk/SLIPS/preventing-overview.htm) and [HSENI office safety](https://www.hseni.gov.uk/articles/health-and-safety-offices). Campus route details remain based on supplied materials and the route-owner correction; no new route or legal requirements were inferred.

Verification: 60 hazard states at 1920, 1440, 1024, 768, 390 and 320px, covering every action before/after, keyboard use, 44px marker targets, unclipped image coordinates, sequential/free navigation, repeat actions, persistence, reset, invalid saved data and continuation to Fire. The updated all-page reading suite covers 427 states (fewer quiz-answer branches now), including enlarged text. The widescreen suite covers 209 states from 320 to 3778px. Screenshots: `output/playwright/office-guided-*.png`. Desktop and mobile reviewed visually; the phone hazard selector is a consistent five-column row.

All suites passed, along with the existing Injury/Haze, 48-state Reporting and ERC/finish-flow checks. No runtime errors, clipped controls, horizontal overflow or flagged paragraph widows remained. Enlarged-text review caught the longer Drawer label getting cramped; content-aware grid minimums now give it room without reducing font size. Production build and diff checks passed.

## Scenario 05: illustrated practice

Replaced the three-channel MCQ board with four concrete situations and guided practice actions: urgent help, injury after care, a falling-box near miss, and a chair defect. Each supplies the cue before the action, then shows a practice stamp and immediate takeaway. No wrong-answer loops, score, calls or submissions. Navigation stays open; all four practice actions enable the next section. Next/Back bring the new situation into view and focus its heading, including on phones.

Added a relevant illustration for every situation. The near-miss and chair-defect scenes were generated specifically for these stories; the existing help and wet-walkway scenes are reused unchanged. See `output/imagegen/scenario-05-prompts.md` for assets and final prompts. The content-first frontend design approach keeps the illustration in the smaller column beside larger, readable practice text. Generated art contains no operational instructions; all learning content is accessible HTML.

General emergency wording was checked against [SCDF Emergency Medical Services](https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services). Near-miss prevention framing was checked against [LTA Near Miss Reporting](https://www.lta.gov.sg/content/ltagov/en/industry_innovations/industry_matters/safety_health_environment/construction_safety_environment/near_miss_reporting.html). Campus contacts and internal reporting channels remain based on supplied project materials; no statutory reporting rules or unconfirmed links were added.

Focused verification: 48 before/after states at 1920, 1440, 1024, 768, 390 and 320px; four distinct successfully loaded images; no clipped controls or horizontal overflow; main learning text at least 18px; keyboard actions, free navigation, persisted progress, reset, reduced motion, and hand-off to blank report practice. Production build, 209-state wide-screen suite, 497-state all-page reading suite (no flagged widows), and ERC finish-flow regression also passed. Desktop and phone screenshots: `output/playwright/report-guided-*.png`. Visual review caught and corrected an inherited dark footer that reduced progress-text contrast.

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

## Reading-layout refinement

The visual direction is content-first: clear, comfortably sized text, quiet supporting illustrations and a single obvious next action. The content order remains situation → small action → learning feedback → continuation. Existing feedback reveals and reduced-motion behaviour are retained; no new decorative motion is added.

- Reduced the oversized, tightly stacked home headline. The tagline wraps by complete phrases, so “go” cannot be stranded by itself at the tested widths.
- Unified chapter headings, paragraph sizes, reading widths and spacing across all five scenarios, practice, contacts and completion.
- Added `ReadingText` for short paragraph endings that browser paragraph wrapping still left isolated. Chapter 03/04 headings group complete phrases without forcing desktop line breaks.
- Switched tablet layouts to one column earlier; kept mobile context images compact. Learning text is not truncated or shrunk to fit.
- Increased report field/choice text and made step navigation compact on small screens. Removed the nested scrolling region inside the practice preview.
- Kept phone numbers together and moved Back to home directly below the completion message.
- Browser interaction testing found the office progress counter covering a hotspot at tablet width. Moved it above the hotspot area and made it pointer-transparent.

Verification: production build and existing guided/ERC regression suites passed. The reading-layout suite exercises 497 screen states across 1440, 1024, 768, 390 and 320px, with additional 125% root-font checks at 640 and 390px. It checks all hazard choices, all seven Fire checkpoints, every Injury/Haze moment before and after feedback, all routing situations, practice steps/review, all contact tabs, completion and reset. Desktop and phone captures are saved under `output/playwright/layout-*.png`.

Final reading-layout result: PASS, 497 states, no clipped controls, no page overflow, no browser runtime errors, and no flagged single-word endings in the audited headings/paragraphs. Main learning text, choices and report fields were checked at 18px or above. Visual review also caught a legacy small-font override on phone hazard choices and an overlong location placeholder; both were corrected.

## Wide-screen spacing refinement

Visual thesis: a fluid, content-first workspace that feels proportionate at normal browser zoom, rather than a narrow fixed-width strip on a large monitor. Content stays in the order heading → scene and action → feedback. Interaction changes are limited to opening the first hazard, visibly identifying its marker, and retaining the existing short feedback reveals and reduced-motion support. No answers are preselected and no progress is awarded on entry.

Replaced the 1240px workspace ceiling with a viewport-responsive 96rem maximum. Desktop type scales with available width, using a rem-based minimum/maximum so browser font preferences remain respected. The action panel keeps more width than the scene image. Removed the empty panel's forced height, kept heading/content gaps compact, and vertically balanced short tasks on tall monitors. Fire's decision panel no longer stretches to fill unused row space. Practice, contacts and completion widths scale with the same type system. The home illustration follows the action promptly on phones, removing the previous empty gap.

Verification: `verify-workspace.js` passed 209 states at 3778×1870, 2560×1440, 2267×1122, 1920×1080, 1440×900, 1366×768, 1024×768, 900×900, 768×1024, 390×844 and 320×740. At 1920px the hazard workspace is 1805px (94% of viewport, previously 1240px/65%); decision text is approximately 23px. At 2560px it uses 92% of the viewport. The illustration is approximately 44% of the desktop workspace. No overflow, clipped controls or runtime errors were found. The existing 497-state reading suite also passed with no flagged heading/paragraph widows. Desktop and phone screenshots were visually reviewed.
