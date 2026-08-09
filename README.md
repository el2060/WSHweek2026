# CLTE Safety Lens

A responsive, self-paced Safety & Health Week 2026 prototype for NP's Centre for Learning & Teaching Excellence (CLTE).

## Run locally

```bash
pnpm install
pnpm dev
```

Use `pnpm build` for a production build and `pnpm preview` to review it locally.

## Updating official information

All operational details and official URLs are centralised in `src/config.ts`.

- `emergencyNumber`: NP emergency reporting number
- `faultNumber`: hazards and defects reporting number
- `assemblyArea`: CLTE assembly destination
- `links`: WSH Portal, online fault report, emergency information, student insurance, and Haze SOP

Leave a link as an empty string to show a clearly labelled “Link to be confirmed” button. No partial or inferred URL is used; replace the placeholders only with complete official destinations.

## Updating scenarios

Office hotspots, wet-walkway actions, evacuation actions and reporting routes are structured in `src/config.ts`. Interactive section components live in `src/App.tsx`.

Hotspot `x` and `y` values are percentages relative to the scene image. Operational text is kept out of the generated art and remains accessible HTML.

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

Confirmed from the decks: Admin Field; 6460 6999 for campus emergencies; prompt injury reporting via WSH Portal; 6460 6000 / online fault reporting for hazards and defects; CLTE emergency roles; Rest & Recovery locations; and the 27 April wet-weather incident near Block 73.

The supplied campus accident SOP adds the serious-medical-injury sequence: call 995 immediately, give the exact location, then inform the NP Guard Post at 6460 6999 so security can guide the ambulance. For student cases, SAS at 6460 6777 coordinates with the relevant School/Division and follows up. The mock report uses the supplied WSH Portal form as a structural reference, but reveals only three practice steps and never asks for names or contact details.

Still requiring official confirmation or full URLs: WSH Portal, emergency-information page, Student Insurance page, Haze SOP, and any building-specific evacuation routes. No route from a CLTE building has been invented in this prototype.

## Privacy and accessibility

There is no backend, submission, authentication or analytics. The optional name, work context, learning focus, progress and closing reflection use browser session storage only. The selected context adapts the guidance in each situation and the final takeaway. Hotspots and activities work with keyboard/touch, controls have visible focus states, and ambient motion respects `prefers-reduced-motion`.

## Illustration generation

The four raster scenes were generated with the built-in image-generation tool using an `illustration-story` prompt set. The final prompt direction specified flat editorial artwork, simplified geometric people, drawn contours, screenprint-style grain, restrained navy/teal/amber/coral colour blocks, and explicit avoidance of photorealism, photographic lighting, text, logos and UI elements.
