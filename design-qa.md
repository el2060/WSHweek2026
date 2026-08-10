# Design QA — CLTE activity homepage copy

## Comparison target

- Source visual truth: `C:\Users\limee\AppData\Local\Temp\codex-clipboard-3f3c820f-9235-41d9-ba0e-130863f95d79.png`
- Browser-rendered implementation: `C:\Users\limee\OneDrive\Documents\ChatGPT\WSH Week Interactive\output\refinement\homepage-clte-copy.png`
- Combined comparison evidence: `C:\Users\limee\OneDrive\Documents\ChatGPT\WSH Week Interactive\output\refinement\homepage-copy-comparison.png`
- Responsive evidence: `C:\Users\limee\OneDrive\Documents\ChatGPT\WSH Week Interactive\output\refinement\homepage-clte-copy-mobile.png`
- Viewport: 1536 × 1024 CSS px; mobile check at 390 × 844 CSS px
- Source pixels: 2392 × 1677
- Implementation pixels: 1536 × 1024
- Device scale factor: 1
- Density normalization: source fitted to 1536 × 1024 for the side-by-side comparison; implementation required no normalization
- State: homepage with previously completed scenario progress and the resume CTA

## Full-view comparison

The implementation preserves the selected safety-focused visual, illustration, palette, split composition, header, CTA position, and motion. Only the ownership and explanatory copy changed. The new hierarchy leads with `CLTE Workplace Safety Activity`, while `Part of NP WSH Week 2026` remains supporting context, so the page reads as a CLTE activity rather than a central campaign.

## Required fidelity surfaces

- Fonts and typography: The existing Manrope and DM Sans families, display weight, line height, and responsive scaling are unchanged. The longer direct title wraps cleanly without clipping at desktop and mobile widths.
- Spacing and layout rhythm: Hero proportions, text anchor, illustration crop, CTA placement, header height, and initial-viewport fit are preserved. No horizontal overflow was visible at 1536 × 1024 or 390 × 844.
- Colors and visual tokens: Cream, navy, teal, coral, opacity overlays, and contrast are unchanged from the selected homepage.
- Image quality and asset fidelity: The existing `public/assets/wsh-week-hero.png` is unchanged and remains sharp at both tested sizes. No replacement illustration, placeholder, or code-drawn substitute was introduced.
- Copy and content: The title now identifies the product directly as a CLTE workplace safety activity. The eyebrow explains that it is part of NP WSH Week 2026. The supporting sentence plainly states that staff will complete five short workplace scenarios.
- Affordances and interaction states: The primary CTA remained visible and functional. With saved progress, `Continue activity` correctly resumed at the guided report simulation, and the NP/CLTE home control returned to the homepage.
- Responsiveness: At 390 × 844, the complete title, description, CTA, and meaningful portion of the safety illustration remain in the initial viewport; the compact menu and sound controls remain accessible.
- Accessibility: The revised home control has a clear accessible label, the headline remains a semantic H1, CTA text remains explicit, focus treatment is unchanged, and browser console inspection returned no errors.

## Focused evidence

The mobile capture was required because the longer utility title has materially different line wrapping at 390 px. It shows the full copy and CTA without truncation. No additional focused desktop crop was needed because the full-view comparison keeps the header, hero copy, CTA, and illustration readable at equal normalized dimensions.

## Comparison history

### Current pass

- No actionable P0, P1, or P2 mismatch was found.
- Intentional content deviation: campaign-style `WSH Safety Week 2026` was replaced with direct CLTE activity wording, as requested.
- Intentional header deviation: `CLTE WSH 2026` was replaced with `CLTE staff activity` to remove the appearance of a central programme identity.
- Post-change browser evidence confirms that the visual treatment and core navigation remain intact.

## Primary interactions tested

- Loaded the homepage at 1536 × 1024.
- Activated `Continue activity` and verified that saved progress resumed at the guided report simulation.
- Activated the NP/CLTE home control and verified return to the homepage.
- Rechecked the homepage at 390 × 844.
- Checked captured browser console errors: none.

## Follow-up polish

- No P3 visual changes are recommended for this scoped copy-only refinement.

final result: passed
