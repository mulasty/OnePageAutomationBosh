# BOSCH SERVICE - AI AUTOMATION ONE PAGE
PROJECT CLOSING AND FINALIZATION RUNBOOK

Status: READY FOR GRAPHICS
Owner: Mula Group
Goal: Deliver a production-ready cinematic sales demo without changing core architecture.
Last Updated: 2026-02-22

---

# 0. Purpose

This runbook controls all work after development lock:
- visual production
- asset integration
- sales polish
- final QA, demo mode, and launch package

Hard rule:
No new features. Finish only inside the existing system.

---

# 1. Locked References

Source files:
- `PROJECT_BOSCH_AI_MASTER.md`
- `app/page.js`
- `app/scroll-engine.js`
- `app/globals.css`

Locked scene order and IDs:
1. hero
2. problems
3. ai-activation
4. intake
5. planning
6. parts
7. communication
8. command-center
9. transformation
10. cta

Locked scroll progress windows:
- hero: 0-10%
- problems: 10-20%
- ai-activation: 20-30%
- intake: 30-40%
- planning: 40-50%
- parts: 50-60%
- communication: 60-70%
- command-center: 70-85%
- transformation: 85-95%
- cta: 95-100%

No-change rules:
- no new sections
- no section reorder
- no scene ID rename
- no timeline redesign
- no structural DOM rewrite

---

# 2. Scope and Non-Goals

In scope:
- replace visual placeholders with final assets
- improve perceived quality, trust, and sales clarity
- keep motion smooth on desktop and mobile
- finalize demo mode and launch readiness

Out of scope:
- new product features
- net-new interactions outside current flow
- changing base narrative or scroll percentages

---

# 3. Glossary

- `Base background`: primary scene image.
- `Overlay`: secondary visual layer over base background.
- `HUD layer`: subtle UI line/grid accent used to signal AI context.
- `Integration pass`: one asset insertion + immediate scroll/regression check.
- `Quality gate`: mandatory pass/fail checkpoint before moving to next phase.

---

# 4. Current Baseline (Completed)

Development baseline already completed:
- [x] one-page scroll architecture
- [x] GSAP ScrollTrigger timeline and scene engine
- [x] locked timeline percentages in code
- [x] 10-scene narrative and content copy
- [x] desktop/mobile smoothness baseline
- [x] no-console-error baseline

Baseline intent:
Graphics phase must improve visual quality without destabilizing this baseline.

---

# 5. Graphics Execution Plan

## Phase A - High impact visuals (first)

Deliverables:
- [x] Hero cinematic background package
- [x] Command Center dashboard environment package
- [x] Transformation before/after visual package

Acceptance criteria:
- scene mood is immediately clear
- text remains readable in all three scenes
- no scroll stutter introduced

## Phase B - Supporting visuals

Deliverables:
- [x] Workshop support backgrounds
- [x] AI overlay and HUD assets
- [x] Replacement of remaining non-final visual placeholders

Acceptance criteria:
- supporting scenes remain visually consistent with Phase A
- overlays add depth without clutter
- scene-to-scene transitions stay coherent

## Phase C - Final touches

Deliverables:
- [x] CTA background
- [x] subtle lighting overlays
- [x] texture and gradient polish

Acceptance criteria:
- final section feels intentional, not empty
- no visual overload
- final CTA remains dominant

---

# 6. Post-Graphics Re-Validation

Run after every integration pass:
- [x] Hero integration test
- [x] Command Center integration test
- [x] Transformation integration test
- [x] full scroll visual consistency check

Technical checks after every pass:
- [x] `npm run build` passes
- [x] no console errors
- [x] section active-state sync still correct
- [x] timeline percentages still preserved

---

# 7. Sales Optimization Refinement

Goal:
Keep cinematic quality while increasing conversion clarity.

Checklist:
- [x] benefit headlines stronger than feature wording
- [x] ROI microcopy aligned to workshop outcomes
- [x] trust markers visible but not noisy
- [x] CTA wording clear and action-first
- [x] emotional contrast preserved in transformation section

---

# 8. Performance and UX Gate

Performance targets:
- [x] all scene images web-optimized and compressed
- [x] no oversized visual files loaded at runtime
- [x] mobile scroll remains smooth after full asset load

UX targets:
- [x] readability on desktop and mobile
- [x] animation timing consistency preserved
- [x] no visual hotspot behind key text areas

---

# 9. Quality Gates (GO / NO-GO)

Gate 1 - Asset pack complete:
- [x] every scene has required final asset set
- [x] naming and folders follow graphics spec
- [x] binary manifest complete and valid

Gate 2 - Integration stable:
- [x] all integrated assets pass build and runtime checks
- [x] no regressions in motion, sync, or readability
- [x] desktop and mobile sanity test complete

Gate 3 - Demo ready:
- [x] intro impact strong in first 10 seconds
- [x] command-center wow moment is clear
- [x] transformation contrast is emotionally visible
- [x] CTA is clear and persuasive

---

# 10. Risk and Rollback Plan

Risks:
- heavy assets reduce scroll smoothness
- high-contrast graphics reduce readability
- inconsistent perspective breaks cinematic continuity

Rollback triggers:
- FPS drop or visible jitter
- copy readability degradation
- failed build or runtime warning spike

Rollback actions:
- revert last asset batch only
- restore previous approved visuals for affected scenes
- re-integrate with reduced file sizes and softer contrast

---

# 11. Client Demo Mode Checklist

Preparation:
- [x] intro section is visually clean and high-impact
- [x] command-center reveal lands as primary wow moment
- [x] transformation feels like clear before/after progression
- [x] final CTA closes with strong action intent

Demo success condition:
Client understands automation value without extra explanation.

---

# 12. Launch Package and Handoff

Package must include:
- [x] final approved asset set
- [x] binary manifest with checksums
- [x] final QA pass notes
- [x] deployment confirmation and build hash
- [x] rollback-ready backup tag/branch

Done definition:
- cinematic quality is consistent across all scenes
- technical stability is preserved
- page is demo-ready and sales-effective
