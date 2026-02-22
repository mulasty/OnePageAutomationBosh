# BOSCH SERVICE - AI AUTOMATION ONE PAGE
GRAPHICS PRODUCTION SPECIFICATION

Status: VISUAL PRODUCTION
Owner: Mula Group
Purpose: Produce final cinematic assets aligned with locked page architecture.
Last Updated: 2026-02-22

---

# 0. Main Objective

Create a consistent cinematic visual layer that supports:
- scroll storytelling
- AI automation narrative
- premium automotive atmosphere

Rule:
Graphics support motion. Graphics do not replace motion or layout logic.

---

# 1. Locked Technical Context

Source of truth:
- scene IDs and order from `app/page.js`
- timeline percentage map from `app/scroll-engine.js` (`sceneProgressRanges`)
- section-specific visual styling from `app/globals.css`

Locked scene map:
1. hero (0-10%)
2. problems (10-20%)
3. ai-activation (20-30%)
4. intake (30-40%)
5. planning (40-50%)
6. parts (50-60%)
7. communication (60-70%)
8. command-center (70-85%)
9. transformation (85-95%)
10. cta (95-100%)

Non-negotiable constraints:
- no DOM structure changes
- no section ID changes
- no timeline percentage changes
- no new sections

---

# 2. Global Visual DNA

Style lock:
- cinematic industrial
- premium automotive
- dark environment
- Bosch red accents
- subtle AI blue glow
- realistic directional lighting

Mood lock:
- BEFORE range (hero to problems): darker, less controlled
- AI transition range (ai-activation to planning): guided, data-driven
- AFTER range (parts to cta): cleaner, organized, confident

---

# 3. Asset Packaging, Naming, and Folders

Required folders:
- `public/assets/graphics/base`
- `public/assets/graphics/overlay`
- `public/assets/graphics/hud`
- `public/assets/graphics/transition`
- `public/assets/graphics/meta`

Filename pattern:
`scene-<scene-id>__layer-<type>__v<NN>.<ext>`

Examples:
- `scene-hero__layer-base__v01.avif`
- `scene-command-center__layer-overlay__v02.webp`
- `scene-transformation__layer-before__v01.avif`

Manifest file (required):
- path: `public/assets/graphics/meta/manifest.json`
- required fields per asset:
  - `assetId`
  - `sceneId`
  - `layerType`
  - `path`
  - `width`
  - `height`
  - `bytes`
  - `mime`
  - `sha256`
  - `status`

---

# 4. Export and Binary Specifications

| Asset type | Preferred format | Allowed fallback | Min resolution | Recommended resolution | Max file size |
| --- | --- | --- | --- | --- | --- |
| Base background | AVIF | WebP | 1920x1080 | 2560x1440 | 650 KB |
| Overlay texture/light | WebP with alpha | PNG | 1600x900 | 2560x1440 | 320 KB |
| HUD/grid accent | WebP with alpha | PNG | 1280x720 | 1920x1080 | 220 KB |
| Before/after pair | AVIF | WebP | 1920x1080 | 2560x1440 | 2 x 700 KB |
| CTA background | AVIF | WebP | 1920x1080 | 2560x1440 | 500 KB |

Binary quality rules:
- color profile must be sRGB
- no embedded text
- no random logo placement
- no metadata bloat

---

# 5. Scene-to-Asset Manifest (Production)

| Scene ID | Progress window | Required assets | Priority | Status |
| --- | --- | --- | --- | --- |
| hero | 0-10% | base + subtle light overlay | High | [ ] |
| problems | 10-20% | darker tone variation base | Medium | [ ] |
| ai-activation | 20-30% | base + glow/hud overlay | Medium | [ ] |
| intake | 30-40% | clean base + UI-friendly overlay | Medium | [ ] |
| planning | 40-50% | structured base + soft grid | Medium | [ ] |
| parts | 50-60% | organized operations base | Medium | [ ] |
| communication | 60-70% | communication signal overlay set | Medium | [ ] |
| command-center | 70-85% | hero dashboard environment + HUD | High | [ ] |
| transformation | 85-95% | before and after matched pair | High | [ ] |
| cta | 95-100% | calm high-contrast CTA base | High | [ ] |

---

# 6. Composition Rules for Current Layout

Readability-safe zones:
- keep central text corridor visually clean
- avoid bright hotspots behind heading and paragraph blocks
- preserve at least one low-noise area for CTA visibility

Motion-safe composition:
- include clear depth cues for parallax
- keep strongest visual anchors away from exact center lock
- avoid many competing focal points

Prohibited composition patterns:
- centered clutter
- aggressive neon contrast
- high-frequency noise across full frame

---

# 7. Integration Contract with Frontend

Integration must stay compatible with:
- section IDs and flow in `app/page.js`
- scene progression logic in `app/scroll-engine.js`
- section background layers in `app/globals.css`

Allowed implementation paths:
- update section backgrounds (`#hero` ... `#cta`)
- update `::before` and `::after` overlay layers
- adjust opacity and blend intensity only when readability fails

Not allowed without explicit re-approval:
- changing timeline percentages
- changing scene order
- altering scroll engine architecture

Integration workflow per asset batch:
1. Place files in the correct folder and update manifest.
2. Integrate by scene ID in CSS.
3. Run build and manual scroll check.
4. Approve or rollback batch.

---

# 8. Binary Consistency and Validation

Mandatory checks:
- [ ] manifest entry exists for every shipped asset
- [ ] MIME type matches extension
- [ ] file size under limit per asset type
- [ ] SHA256 checksum recorded
- [ ] no duplicate binary files under different names

Recommended local checks:
- [ ] list oversized assets and reduce/compress
- [ ] verify only referenced assets are shipped
- [ ] remove abandoned drafts before demo branch cut

---

# 9. AI Generation Guidelines (If AI Is Used)

Global prompt core:
- cinematic wide shot
- industrial workshop context
- premium automotive lighting
- realistic commercial photography
- subtle atmospheric haze
- no text, no watermark

Negative prompt core:
- no typography
- no cartoon style
- no over-saturated neon
- no extra logos
- no distorted perspective

Per-scene direction hints:
- hero: calm power, directional side light, deep workshop depth
- problems: darker variant with tension but readable center
- ai-activation: controlled blue glow and subtle scan lines
- intake: clean operational scene with low clutter
- planning: organized blocks, structured geometry, soft grid
- parts: technical clarity, prepared operations mood
- communication: notification-like visual rhythm, restrained glow
- command-center: strongest intelligence/control moment
- transformation: same camera logic for before/after pair
- cta: calm confidence, minimal distraction, conversion focus

Consistency lock for AI outputs:
- same lens feeling across all scenes
- same lighting direction family
- same palette family
- perspective continuity between neighboring scenes

---

# 10. Integration Checklist Per Pass

After each insertion:
- [ ] place asset in correct scene folder
- [ ] update manifest entry
- [ ] integrate into target scene layer
- [ ] test text readability
- [ ] test scroll behavior
- [ ] test depth/parallax perception
- [ ] run `npm run build`

---

# 11. Done Definition for Graphics Phase

Graphics phase is complete when:
- all required scene assets are integrated and validated
- visual language is consistent across all 10 scenes
- no performance or readability regression is observed
- cinematic mood is preserved in full-scroll playback
- client can understand value emotionally before reading full copy
