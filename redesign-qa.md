# CLTE guided scenario redesign — 26 August 2026

## Concise choices and feedback — latest refinement

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
