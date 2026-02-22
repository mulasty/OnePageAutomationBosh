import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initScrollExperience() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  function mediaMatches(query) {
    return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  }

  function getRuntimeProfile() {
    const isMobileViewport = mediaMatches("(max-width: 900px)");
    const prefersReducedMotion = mediaMatches("(prefers-reduced-motion: reduce)");
    const depthScale = prefersReducedMotion ? 0.45 : isMobileViewport ? 0.72 : 1;
    const phaseDuration = prefersReducedMotion
      ? { enter: 0.12, active: 0.28, exit: 0.12 }
      : isMobileViewport
        ? { enter: 0.18, active: 0.52, exit: 0.18 }
        : { enter: 0.2, active: 0.6, exit: 0.2 };

    return {
      isMobileViewport,
      prefersReducedMotion,
      useInstantNavScroll: prefersReducedMotion || isMobileViewport,
      scrub: prefersReducedMotion ? 0.35 : isMobileViewport ? 0.9 : 1.2,
      depthScale,
      phaseDuration,
    };
  }

  function applyRuntimeProfile() {
    const profile = getRuntimeProfile();
    const scale = profile.depthScale;
    const depthValue = (value) => Number((value * scale).toFixed(3));

    state.runtimeProfile = profile;
    CONFIG.scrub = profile.scrub;
    CONFIG.phaseDuration = profile.phaseDuration;
    CONFIG.depthMotion = {
      background: {
        enterFromY: depthValue(1.5),
        activeToY: depthValue(-1.2),
        exitToY: depthValue(-1.8),
      },
      midground: {
        enterFromY: depthValue(3),
        activeToY: depthValue(-2.4),
        exitToY: depthValue(-3.4),
      },
      foreground: {
        enterFromY: depthValue(4.5),
        activeToY: depthValue(-3.6),
        exitToY: depthValue(-5),
      },
    };
  }

  const CONFIG = {
    rootSelector: "#scroll-root",
    sectionSelector: ".panel",
    scrub: 1.2,
    debugMarkers: false, // Set true to enable ScrollTrigger markers during debug.
    phaseDuration: {
      enter: 0.2,
      active: 0.6,
      exit: 0.2,
    },
    depthMotion: {
      background: {
        enterFromY: 1.5,
        activeToY: -1.2,
        exitToY: -1.8,
      },
      midground: {
        enterFromY: 3,
        activeToY: -2.4,
        exitToY: -3.4,
      },
      foreground: {
        enterFromY: 4.5,
        activeToY: -3.6,
        exitToY: -5,
      },
    },
  };

  const state = {
    root: null,
    sections: [],
    scenes: [],
    masterTimeline: null,
    activeSectionIndex: -1,
    resizeTimer: null,
    navList: null,
    onResize: null,
    runtimeProfile: null,
  };

  function hasEngineDependencies() {
    return typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  }

  function cacheDom() {
    state.root = document.querySelector(CONFIG.rootSelector);
    state.sections = state.root
      ? Array.from(state.root.querySelectorAll(CONFIG.sectionSelector))
      : [];
  }

  function setActiveSection(index) {
    if (state.activeSectionIndex === index) {
      return;
    }

    state.sections.forEach((section, sectionIndex) => {
      section.setAttribute("data-active", sectionIndex === index ? "true" : "false");
    });

    state.activeSectionIndex = index;
    syncNavActiveItem(index);
  }

  function syncNavActiveItem(index) {
    if (!state.navList) {
      return;
    }

    const activeSection = index >= 0 ? state.sections[index] : null;
    const activeHref = activeSection ? `#${activeSection.id}` : null;
    const links = state.navList.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      if (activeHref && link.getAttribute("href") === activeHref) {
        link.setAttribute("aria-current", "true");
        return;
      }

      link.removeAttribute("aria-current");
    });
  }

  function resolveSceneLayers(content) {
    const heading = content.querySelector("h1, h2");
    const paragraph = content.querySelector("p");
    const usedTargets = new Set();

    function pickLayerTarget(primary, fallback) {
      if (primary && !usedTargets.has(primary)) {
        usedTargets.add(primary);
        return primary;
      }

      if (fallback && !usedTargets.has(fallback)) {
        usedTargets.add(fallback);
        return fallback;
      }

      return null;
    }

    return {
      background: {
        target: pickLayerTarget(content, null),
      },
      midground: {
        target: pickLayerTarget(heading, content),
      },
      foreground: {
        target: pickLayerTarget(paragraph, content),
      },
    };
  }

  function withLayerTransform(layerConfig, values) {
    if (!layerConfig || !layerConfig.target) {
      return null;
    }

    return {
      ...values,
      overwrite: "auto",
      force3D: true,
    };
  }

  function ensureHeroCta(content) {
    let cta = content.querySelector('[data-hero-cta="true"]');
    if (cta) {
      return cta;
    }

    cta = document.createElement("a");
    cta.href = "#cta";
    cta.className = "hero-cta";
    cta.dataset.heroCta = "true";
    cta.textContent = "Book 30-min AI Blueprint";
    content.appendChild(cta);

    return cta;
  }

  function createHeroRevealConfig(content) {
    const heading = content.querySelector("h1, h2");
    const subtitle = content.querySelector("p");
    const cta = ensureHeroCta(content);

    return {
      heading,
      subtitle,
      cta,
      lightFrom: {
        "--hero-light": 0,
        "--hero-darkness": 1,
      },
      lightTo: {
        "--hero-light": 1,
        "--hero-darkness": 0.25,
        duration: CONFIG.phaseDuration.enter,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      lightActiveTo: {
        "--hero-light": 1.08,
        "--hero-darkness": 0.15,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      },
      lightExitTo: {
        "--hero-light": 1,
        "--hero-darkness": 0.32,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      headingFrom: {
        autoAlpha: 0,
        yPercent: 12,
        scale: 0.94,
      },
      headingTo: {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.78,
        ease: "power3.out",
        overwrite: "auto",
      },
      subtitleFrom: {
        autoAlpha: 0,
        yPercent: 16,
        scale: 0.98,
      },
      subtitleTo: {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.62,
        ease: "power2.out",
        overwrite: "auto",
      },
      ctaFrom: {
        autoAlpha: 0,
        yPercent: 18,
        scale: 0.975,
      },
      ctaTo: {
        autoAlpha: 1,
        yPercent: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.56,
        ease: "power2.out",
        overwrite: "auto",
      },
      ctaExitTo: {
        autoAlpha: 0.85,
        yPercent: -2,
        scale: 0.995,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
    };
  }

  function createProblemsRevealConfig(content) {
    const heading = content.querySelector("h1, h2");
    const subtitle = content.querySelector("p");
    const items = [heading, subtitle].filter(Boolean);

    return {
      items,
      toneFrom: {
        "--problems-darkness": 1,
        "--problems-accent": 0.65,
      },
      toneTo: {
        "--problems-darkness": 0.88,
        "--problems-accent": 0.85,
        duration: CONFIG.phaseDuration.enter,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      toneActiveTo: {
        "--problems-darkness": 0.8,
        "--problems-accent": 1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      },
      toneExitTo: {
        "--problems-darkness": 0.9,
        "--problems-accent": 0.75,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      itemFromFactory: (index) => ({
        autoAlpha: 0,
        y: 24 + index * 12,
      }),
      itemToFactory: () => ({
        autoAlpha: 1,
        y: 0,
        duration: CONFIG.phaseDuration.enter * 0.7,
        ease: "power2.out",
        overwrite: "auto",
      }),
      itemActiveToFactory: () => ({
        autoAlpha: 1,
        y: -4,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      }),
      itemExitToFactory: (index) => ({
        autoAlpha: index === 0 ? 0.78 : 0.72,
        y: -8,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      }),
      staggerStep: 0.08,
    };
  }

  function createAiActivationRevealConfig(content) {
    const heading = content.querySelector("h1, h2");
    const subtitle = content.querySelector("p");
    const items = [heading, subtitle].filter(Boolean);

    return {
      items,
      atmosphereFrom: {
        "--activation-glow": 0.2,
        "--activation-darkness": 0.98,
        "--activation-scan": 0.05,
      },
      atmosphereTo: {
        "--activation-glow": 0.88,
        "--activation-darkness": 0.62,
        "--activation-scan": 0.72,
        duration: CONFIG.phaseDuration.enter,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      atmosphereActiveTo: {
        "--activation-glow": 1,
        "--activation-darkness": 0.5,
        "--activation-scan": 1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      },
      atmosphereExitTo: {
        "--activation-glow": 0.72,
        "--activation-darkness": 0.58,
        "--activation-scan": 0.85,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      itemFromFactory: (index) => ({
        autoAlpha: 0,
        y: 16 + index * 10,
        scale: 0.985,
      }),
      itemToFactory: () => ({
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.72,
        ease: "power2.out",
        overwrite: "auto",
      }),
      itemActiveToFactory: (index) => ({
        autoAlpha: 1,
        y: index === 0 ? -1.5 : -1,
        scale: 1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      }),
      itemExitToFactory: () => ({
        autoAlpha: 0.9,
        y: -3,
        scale: 1,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      }),
      staggerStep: 0.09,
    };
  }

  function ensureIntakeFlowElements(content) {
    const existingFlow = content.querySelector('[data-intake-flow="true"]');
    if (existingFlow) {
      return {
        flow: existingFlow,
        request: existingFlow.querySelector('[data-intake-step="request"]'),
        processing: existingFlow.querySelector('[data-intake-step="processing"]'),
        card: existingFlow.querySelector('[data-intake-step="card"]'),
      };
    }

    const flow = document.createElement("div");
    flow.className = "intake-flow";
    flow.dataset.intakeFlow = "true";

    const request = document.createElement("div");
    request.className = "intake-step intake-step--request";
    request.dataset.intakeStep = "request";
    request.textContent = "Incoming request captured in under 15 seconds";

    const processing = document.createElement("div");
    processing.className = "intake-step intake-step--processing";
    processing.dataset.intakeStep = "processing";
    processing.textContent = "AI checks urgency, vehicle data, and customer history";

    const card = document.createElement("div");
    card.className = "intake-step intake-step--card";
    card.dataset.intakeStep = "card";
    card.textContent = "Service card generated automatically with 60% less admin time";

    flow.append(request, processing, card);
    content.appendChild(flow);

    return {
      flow,
      request,
      processing,
      card,
    };
  }

  function createIntakeRevealConfig(content) {
    const heading = content.querySelector("h1, h2");
    const subtitle = content.querySelector("p");
    const intakeFlow = ensureIntakeFlowElements(content);
    const items = [heading, subtitle, intakeFlow.request, intakeFlow.processing, intakeFlow.card].filter(
      Boolean
    );

    return {
      items,
      heading,
      subtitle,
      flow: intakeFlow,
      atmosphereFrom: {
        "--intake-glow": 0.24,
        "--intake-darkness": 0.96,
        "--intake-focus": 0.15,
      },
      atmosphereTo: {
        "--intake-glow": 0.8,
        "--intake-darkness": 0.66,
        "--intake-focus": 0.72,
        duration: CONFIG.phaseDuration.enter,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      atmosphereActiveTo: {
        "--intake-glow": 0.95,
        "--intake-darkness": 0.56,
        "--intake-focus": 1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      },
      atmosphereExitTo: {
        "--intake-glow": 0.72,
        "--intake-darkness": 0.62,
        "--intake-focus": 0.86,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      headingFrom: {
        autoAlpha: 0,
        y: 18,
      },
      headingTo: {
        autoAlpha: 1,
        y: 0,
        duration: CONFIG.phaseDuration.enter * 0.56,
        ease: "power2.out",
        overwrite: "auto",
      },
      subtitleFrom: {
        autoAlpha: 0,
        y: 16,
      },
      subtitleTo: {
        autoAlpha: 1,
        y: 0,
        duration: CONFIG.phaseDuration.enter * 0.48,
        ease: "power2.out",
        overwrite: "auto",
      },
      stepFromFactory: (index) => ({
        autoAlpha: 0,
        y: 14 + index * 8,
        scale: 0.99,
      }),
      stepToFactory: () => ({
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.45,
        ease: "power2.out",
        overwrite: "auto",
      }),
      stepActiveToFactory: () => ({
        autoAlpha: 1,
        y: -2,
        scale: 1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      }),
      stepExitToFactory: (index) => ({
        autoAlpha: index < 2 ? 0.84 : 0.9,
        y: -4,
        scale: 1,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      }),
      stepStagger: 0.09,
    };
  }

  function ensurePlanningFlowElements(content) {
    const existingFlow = content.querySelector('[data-planning-flow="true"]');
    if (existingFlow) {
      return {
        flow: existingFlow,
        sourceCard: existingFlow.querySelector('[data-planning-part="source-card"]'),
        pieces: Array.from(existingFlow.querySelectorAll('[data-planning-part="piece"]')),
        timeline: existingFlow.querySelector('[data-planning-part="timeline"]'),
        timelineSlots: Array.from(existingFlow.querySelectorAll('[data-planning-part="timeline-slot"]')),
      };
    }

    const flow = document.createElement("div");
    flow.className = "planning-flow";
    flow.dataset.planningFlow = "true";

    const sourceCard = document.createElement("div");
    sourceCard.className = "planning-source-card";
    sourceCard.dataset.planningPart = "source-card";
    sourceCard.textContent = "Ready card moved from intake to planning board";

    const board = document.createElement("div");
    board.className = "planning-board";

    const pieceLabels = [
      "Job block A - same day diagnostics",
      "Job block B - high-margin maintenance",
      "Job block C - pickup-ready repairs",
    ];

    const pieces = pieceLabels.map((label) => {
      const piece = document.createElement("div");
      piece.className = "planning-piece";
      piece.dataset.planningPart = "piece";
      piece.textContent = label;
      return piece;
    });

    board.append(...pieces);

    const timeline = document.createElement("div");
    timeline.className = "planning-timeline";
    timeline.dataset.planningPart = "timeline";

    const slotLabels = [
      "Slot 1 - Priority intake (0-2h)",
      "Slot 2 - Parts preparation (-40% waiting)",
      "Slot 3 - Delivery window with customer ETA",
    ];

    const timelineSlots = slotLabels.map((label) => {
      const slot = document.createElement("div");
      slot.className = "planning-slot";
      slot.dataset.planningPart = "timeline-slot";
      slot.textContent = label;
      return slot;
    });

    timeline.append(...timelineSlots);
    flow.append(sourceCard, board, timeline);
    content.appendChild(flow);

    return {
      flow,
      sourceCard,
      pieces,
      timeline,
      timelineSlots,
    };
  }

  function createPlanningRevealConfig(content) {
    const heading = content.querySelector("h1, h2");
    const subtitle = content.querySelector("p");
    const planningFlow = ensurePlanningFlowElements(content);
    const pieces = planningFlow.pieces || [];
    const timelineSlots = planningFlow.timelineSlots || [];
    const items = [heading, subtitle, planningFlow.sourceCard, ...pieces, ...timelineSlots].filter(Boolean);

    const pieceOffsets = [
      { x: -32, y: 20, rotation: -4 },
      { x: 26, y: 18, rotation: 3 },
      { x: 18, y: -22, rotation: 5 },
    ];

    return {
      items,
      heading,
      subtitle,
      flow: planningFlow,
      atmosphereFrom: {
        "--planning-grid": 0.12,
        "--planning-focus": 0.14,
        "--planning-darkness": 0.96,
      },
      atmosphereTo: {
        "--planning-grid": 0.72,
        "--planning-focus": 0.7,
        "--planning-darkness": 0.68,
        duration: CONFIG.phaseDuration.enter,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      atmosphereActiveTo: {
        "--planning-grid": 1,
        "--planning-focus": 1,
        "--planning-darkness": 0.58,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      },
      atmosphereExitTo: {
        "--planning-grid": 0.82,
        "--planning-focus": 0.84,
        "--planning-darkness": 0.64,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      headingFrom: {
        autoAlpha: 0,
        y: 16,
      },
      headingTo: {
        autoAlpha: 1,
        y: 0,
        duration: CONFIG.phaseDuration.enter * 0.54,
        ease: "power2.out",
        overwrite: "auto",
      },
      subtitleFrom: {
        autoAlpha: 0,
        y: 14,
      },
      subtitleTo: {
        autoAlpha: 1,
        y: 0,
        duration: CONFIG.phaseDuration.enter * 0.48,
        ease: "power2.out",
        overwrite: "auto",
      },
      sourceCardFrom: {
        autoAlpha: 0,
        y: 20,
        scale: 0.97,
      },
      sourceCardTo: {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.5,
        ease: "power2.out",
        overwrite: "auto",
      },
      sourceCardActiveTo: {
        autoAlpha: 0.92,
        y: -7,
        scale: 0.985,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      },
      sourceCardExitTo: {
        autoAlpha: 0.86,
        y: -10,
        scale: 0.98,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      pieceFromFactory: (index) => ({
        autoAlpha: 0,
        x: pieceOffsets[index % pieceOffsets.length].x,
        y: pieceOffsets[index % pieceOffsets.length].y,
        rotation: pieceOffsets[index % pieceOffsets.length].rotation,
        scale: 0.98,
      }),
      pieceToFactory: () => ({
        autoAlpha: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.44,
        ease: "power2.out",
        overwrite: "auto",
      }),
      pieceActiveToFactory: (index) => ({
        autoAlpha: 1,
        x: index - 1,
        y: -2,
        rotation: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      }),
      pieceExitToFactory: () => ({
        autoAlpha: 0.9,
        y: -4,
        rotation: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      }),
      timelineSlotFromFactory: (index) => ({
        autoAlpha: 0,
        x: 20 + index * 4,
        y: 8,
      }),
      timelineSlotToFactory: () => ({
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: CONFIG.phaseDuration.enter * 0.42,
        ease: "power2.out",
        overwrite: "auto",
      }),
      timelineSlotActiveToFactory: () => ({
        autoAlpha: 1,
        x: 0,
        y: -1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      }),
      timelineSlotExitToFactory: (index) => ({
        autoAlpha: index === timelineSlots.length - 1 ? 0.94 : 0.86,
        x: 0,
        y: -3,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      }),
      pieceStagger: 0.07,
      timelineStagger: 0.06,
    };
  }

  function createOperationalRevealConfig(sceneId, content) {
    const heading = content.querySelector("h1, h2");
    const subtitle = content.querySelector("p");
    const items = [heading, subtitle].filter(Boolean);
    const presetByScene = {
      parts: {
        glowFrom: 0.22,
        darknessFrom: 0.96,
        scanFrom: 0.08,
        glowTo: 0.74,
        darknessTo: 0.74,
        scanTo: 0.62,
        glowActive: 0.9,
        darknessActive: 0.62,
        scanActive: 0.92,
        glowExit: 0.68,
        darknessExit: 0.7,
        scanExit: 0.76,
        driftX: 1.4,
      },
      communication: {
        glowFrom: 0.16,
        darknessFrom: 0.98,
        scanFrom: 0.06,
        glowTo: 0.68,
        darknessTo: 0.72,
        scanTo: 0.66,
        glowActive: 0.82,
        darknessActive: 0.6,
        scanActive: 1,
        glowExit: 0.62,
        darknessExit: 0.68,
        scanExit: 0.84,
        driftX: -1.5,
      },
      "command-center": {
        glowFrom: 0.24,
        darknessFrom: 0.96,
        scanFrom: 0.08,
        glowTo: 0.82,
        darknessTo: 0.66,
        scanTo: 0.78,
        glowActive: 1,
        darknessActive: 0.52,
        scanActive: 1,
        glowExit: 0.78,
        darknessExit: 0.62,
        scanExit: 0.86,
        driftX: 1.8,
      },
      transformation: {
        glowFrom: 0.24,
        darknessFrom: 0.95,
        scanFrom: 0.08,
        glowTo: 0.9,
        darknessTo: 0.6,
        scanTo: 0.72,
        glowActive: 1.05,
        darknessActive: 0.46,
        scanActive: 0.96,
        glowExit: 0.86,
        darknessExit: 0.58,
        scanExit: 0.8,
        driftX: 1.2,
      },
      cta: {
        glowFrom: 0.2,
        darknessFrom: 0.92,
        scanFrom: 0.06,
        glowTo: 0.82,
        darknessTo: 0.56,
        scanTo: 0.66,
        glowActive: 0.96,
        darknessActive: 0.42,
        scanActive: 0.82,
        glowExit: 0.9,
        darknessExit: 0.5,
        scanExit: 0.72,
        driftX: -1.1,
      },
    };
    const preset = presetByScene[sceneId] || presetByScene.parts;

    return {
      items,
      toneFrom: {
        "--ops-glow": preset.glowFrom,
        "--ops-darkness": preset.darknessFrom,
        "--ops-scan": preset.scanFrom,
      },
      toneTo: {
        "--ops-glow": preset.glowTo,
        "--ops-darkness": preset.darknessTo,
        "--ops-scan": preset.scanTo,
        duration: CONFIG.phaseDuration.enter,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      toneActiveTo: {
        "--ops-glow": preset.glowActive,
        "--ops-darkness": preset.darknessActive,
        "--ops-scan": preset.scanActive,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      },
      toneExitTo: {
        "--ops-glow": preset.glowExit,
        "--ops-darkness": preset.darknessExit,
        "--ops-scan": preset.scanExit,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      },
      itemFromFactory: (index) => ({
        autoAlpha: 0,
        y: 20 + index * 8,
        x: preset.driftX * (index + 1) * 1.6,
        scale: 0.986,
      }),
      itemToFactory: () => ({
        autoAlpha: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: CONFIG.phaseDuration.enter * 0.65,
        ease: "power2.out",
        overwrite: "auto",
      }),
      itemActiveToFactory: (index) => ({
        autoAlpha: 1,
        y: index === 0 ? -2.3 : -1.6,
        x: preset.driftX * 0.32,
        scale: 1,
        duration: CONFIG.phaseDuration.active,
        ease: "none",
        overwrite: "auto",
      }),
      itemExitToFactory: (index) => ({
        autoAlpha: index === 0 ? 0.9 : 0.84,
        y: -4,
        x: preset.driftX * 0.25,
        scale: 0.996,
        duration: CONFIG.phaseDuration.exit,
        ease: "sine.inOut",
        overwrite: "auto",
      }),
      staggerStep: 0.085,
    };
  }

  function createSceneModule(section, index) {
    const sceneId = section.id || `scene-${index + 1}`;
    const content = section.querySelector(".panel-content") || section;
    const layers = resolveSceneLayers(content);
    const isHero = sceneId === "hero";
    const isProblems = sceneId === "problems";
    const isAiActivation = sceneId === "ai-activation";
    const isIntake = sceneId === "intake";
    const isPlanning = sceneId === "planning";
    const isOperational =
      sceneId === "parts" ||
      sceneId === "communication" ||
      sceneId === "command-center" ||
      sceneId === "transformation" ||
      sceneId === "cta";
    const heroReveal = isHero ? createHeroRevealConfig(content) : null;
    const problemsReveal = isProblems ? createProblemsRevealConfig(content) : null;
    const aiActivationReveal = isAiActivation ? createAiActivationRevealConfig(content) : null;
    const intakeReveal = isIntake ? createIntakeRevealConfig(content) : null;
    const planningReveal = isPlanning ? createPlanningRevealConfig(content) : null;
    const operationalReveal = isOperational ? createOperationalRevealConfig(sceneId, content) : null;

    section.setAttribute("data-scene-id", sceneId);
    section.setAttribute("data-scene-index", String(index));
    section.setAttribute("data-scene-phase", "idle");

    return {
      id: sceneId,
      index,
      element: section,
      labels: {
        enter: `${sceneId}-enter`,
        active: `${sceneId}-active`,
        exit: `${sceneId}-exit`,
      },
      hooks: {
        enter: () => {},
        active: () => {},
        exit: () => {},
      },
      isHero,
      heroReveal,
      isProblems,
      problemsReveal,
      isAiActivation,
      aiActivationReveal,
      isIntake,
      intakeReveal,
      isPlanning,
      planningReveal,
      isOperational,
      operationalReveal,
      layers,
      motion: {
        target:
          isHero || isProblems || isAiActivation || isIntake || isPlanning || isOperational
            ? content
            : layers.foreground.target || content,
        enterFrom: {
          autoAlpha:
            isHero || isProblems || isAiActivation || isIntake || isPlanning || isOperational
              ? 1
              : 0.35,
          yPercent: 0,
          scale:
            isHero || isProblems || isAiActivation || isIntake || isPlanning || isOperational
              ? 1
              : 0.992,
        },
        enterTo: {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
          duration: CONFIG.phaseDuration.enter,
          ease: "power2.out",
          overwrite: "auto",
        },
        activeTo: {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
          duration: CONFIG.phaseDuration.active,
          ease: "none",
          overwrite: "auto",
        },
        exitTo: {
          autoAlpha: 0.7,
          yPercent: 0,
          scale: 0.996,
          duration: CONFIG.phaseDuration.exit,
          ease: "power1.inOut",
          overwrite: "auto",
        },
      },
      depth: {
        background: {
          enterFrom: withLayerTransform(layers.background, {
            yPercent: CONFIG.depthMotion.background.enterFromY,
          }),
          enterTo: withLayerTransform(layers.background, {
            yPercent: 0,
            duration: CONFIG.phaseDuration.enter,
            ease: "power1.out",
          }),
          activeTo: withLayerTransform(layers.background, {
            yPercent: CONFIG.depthMotion.background.activeToY,
            duration: CONFIG.phaseDuration.active,
            ease: "none",
          }),
          exitTo: withLayerTransform(layers.background, {
            yPercent: CONFIG.depthMotion.background.exitToY,
            duration: CONFIG.phaseDuration.exit,
            ease: "none",
          }),
        },
        midground: {
          enterFrom: withLayerTransform(layers.midground, {
            yPercent: CONFIG.depthMotion.midground.enterFromY,
          }),
          enterTo: withLayerTransform(layers.midground, {
            yPercent: 0,
            duration: CONFIG.phaseDuration.enter,
            ease: "power1.out",
          }),
          activeTo: withLayerTransform(layers.midground, {
            yPercent: CONFIG.depthMotion.midground.activeToY,
            duration: CONFIG.phaseDuration.active,
            ease: "none",
          }),
          exitTo: withLayerTransform(layers.midground, {
            yPercent: CONFIG.depthMotion.midground.exitToY,
            duration: CONFIG.phaseDuration.exit,
            ease: "none",
          }),
        },
        foreground: {
          enterFrom: withLayerTransform(layers.foreground, {
            yPercent: CONFIG.depthMotion.foreground.enterFromY,
          }),
          enterTo: withLayerTransform(layers.foreground, {
            yPercent: 0,
            duration: CONFIG.phaseDuration.enter,
            ease: "power1.out",
          }),
          activeTo: withLayerTransform(layers.foreground, {
            yPercent: CONFIG.depthMotion.foreground.activeToY,
            duration: CONFIG.phaseDuration.active,
            ease: "none",
          }),
          exitTo: withLayerTransform(layers.foreground, {
            yPercent: CONFIG.depthMotion.foreground.exitToY,
            duration: CONFIG.phaseDuration.exit,
            ease: "none",
          }),
        },
      },
    };
  }

  function buildSceneModules() {
    state.scenes = state.sections.map((section, index) => createSceneModule(section, index));
  }

  function prepareSceneBaseStates() {
    state.scenes.forEach((scene, index) => {
      if (scene.isHero && scene.heroReveal) {
        gsap.set(scene.element, {
          "--hero-light": 0,
          "--hero-darkness": 1,
        });

        if (scene.heroReveal.heading) {
          gsap.set(scene.heroReveal.heading, {
            ...scene.heroReveal.headingFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        if (scene.heroReveal.subtitle) {
          gsap.set(scene.heroReveal.subtitle, {
            ...scene.heroReveal.subtitleFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        if (scene.heroReveal.cta) {
          gsap.set(scene.heroReveal.cta, {
            ...scene.heroReveal.ctaFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }
      }

      if (scene.isProblems && scene.problemsReveal) {
        gsap.set(scene.element, {
          "--problems-darkness": 1,
          "--problems-accent": 0.65,
        });

        scene.problemsReveal.items.forEach((item, index) => {
          gsap.set(item, {
            ...scene.problemsReveal.itemFromFactory(index),
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      }

      if (scene.isAiActivation && scene.aiActivationReveal) {
        gsap.set(scene.element, {
          "--activation-glow": 0.2,
          "--activation-darkness": 0.98,
          "--activation-scan": 0.05,
        });

        scene.aiActivationReveal.items.forEach((item, index) => {
          gsap.set(item, {
            ...scene.aiActivationReveal.itemFromFactory(index),
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      }

      if (scene.isIntake && scene.intakeReveal) {
        gsap.set(scene.element, {
          "--intake-glow": 0.24,
          "--intake-darkness": 0.96,
          "--intake-focus": 0.15,
        });

        if (scene.intakeReveal.heading) {
          gsap.set(scene.intakeReveal.heading, {
            ...scene.intakeReveal.headingFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        if (scene.intakeReveal.subtitle) {
          gsap.set(scene.intakeReveal.subtitle, {
            ...scene.intakeReveal.subtitleFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        const intakeSteps = [
          scene.intakeReveal.flow.request,
          scene.intakeReveal.flow.processing,
          scene.intakeReveal.flow.card,
        ].filter(Boolean);

        intakeSteps.forEach((step, index) => {
          gsap.set(step, {
            ...scene.intakeReveal.stepFromFactory(index),
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      }

      if (scene.isPlanning && scene.planningReveal) {
        gsap.set(scene.element, {
          "--planning-grid": 0.12,
          "--planning-focus": 0.14,
          "--planning-darkness": 0.96,
        });

        if (scene.planningReveal.heading) {
          gsap.set(scene.planningReveal.heading, {
            ...scene.planningReveal.headingFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        if (scene.planningReveal.subtitle) {
          gsap.set(scene.planningReveal.subtitle, {
            ...scene.planningReveal.subtitleFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        if (scene.planningReveal.flow.sourceCard) {
          gsap.set(scene.planningReveal.flow.sourceCard, {
            ...scene.planningReveal.sourceCardFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        const planningPieces = scene.planningReveal.flow.pieces || [];
        planningPieces.forEach((piece, index) => {
          gsap.set(piece, {
            ...scene.planningReveal.pieceFromFactory(index),
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });

        const planningTimelineSlots = scene.planningReveal.flow.timelineSlots || [];
        planningTimelineSlots.forEach((slot, index) => {
          gsap.set(slot, {
            ...scene.planningReveal.timelineSlotFromFactory(index),
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      }

      if (scene.isOperational && scene.operationalReveal) {
        gsap.set(scene.element, scene.operationalReveal.toneFrom);

        scene.operationalReveal.items.forEach((item, index) => {
          gsap.set(item, {
            ...scene.operationalReveal.itemFromFactory(index),
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      }

      gsap.set(scene.motion.target, {
        autoAlpha: index === 0 ? 1 : scene.motion.enterFrom.autoAlpha,
        yPercent: index === 0 ? 0 : scene.motion.enterFrom.yPercent,
        scale: index === 0 ? 1 : scene.motion.enterFrom.scale,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      const depthLayers = [scene.layers.background, scene.layers.midground, scene.layers.foreground];
      depthLayers.forEach((layer) => {
        if (!layer || !layer.target) {
          return;
        }

        gsap.set(layer.target, {
          transformOrigin: "50% 50%",
          force3D: true,
        });
      });
    });
  }

  function runScenePhase(scene, phase) {
    scene.element.setAttribute("data-scene-phase", phase);

    if (typeof scene.hooks[phase] === "function") {
      scene.hooks[phase]();
    }

    if (phase === "active") {
      setActiveSection(scene.index);
    }
  }

  function addSceneSlot(masterTimeline, scene) {
    const isLastScene = scene.index === state.scenes.length - 1;
    if (scene.isHero && scene.heroReveal) {
      addHeroSceneSlot(masterTimeline, scene, isLastScene);
      return;
    }
    if (scene.isProblems && scene.problemsReveal) {
      addProblemsSceneSlot(masterTimeline, scene, isLastScene);
      return;
    }
    if (scene.isAiActivation && scene.aiActivationReveal) {
      addAiActivationSceneSlot(masterTimeline, scene, isLastScene);
      return;
    }
    if (scene.isIntake && scene.intakeReveal) {
      addIntakeSceneSlot(masterTimeline, scene, isLastScene);
      return;
    }
    if (scene.isPlanning && scene.planningReveal) {
      addPlanningSceneSlot(masterTimeline, scene, isLastScene);
      return;
    }
    if (scene.isOperational && scene.operationalReveal) {
      addOperationalSceneSlot(masterTimeline, scene, isLastScene);
      return;
    }

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(
      scene.motion.target,
      scene.motion.enterFrom,
      scene.motion.enterTo
    );
    addDepthTween(masterTimeline, scene.layers.background.target, scene.depth.background.enterFrom, scene.depth.background.enterTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, scene.depth.midground.enterFrom, scene.depth.midground.enterTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, scene.depth.foreground.enterFrom, scene.depth.foreground.enterTo, "<");

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.motion.target, scene.motion.activeTo);
    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.activeTo, "<");

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.motion.target, scene.motion.exitTo);
    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.exitTo, "<");

    addSceneShift(masterTimeline, scene.index, isLastScene);
  }

  function addOperationalSceneSlot(masterTimeline, scene, isLastScene) {
    const operational = scene.operationalReveal;

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(scene.element, operational.toneFrom, operational.toneTo);

    addDepthTween(
      masterTimeline,
      scene.layers.background.target,
      scene.depth.background.enterFrom,
      scene.depth.background.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.midground.target,
      scene.depth.midground.enterFrom,
      scene.depth.midground.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.foreground.target,
      scene.depth.foreground.enterFrom,
      scene.depth.foreground.enterTo,
      "<"
    );

    operational.items.forEach((item, index) => {
      addElementTween(
        masterTimeline,
        item,
        operational.itemFromFactory(index),
        operational.itemToFactory(),
        index === 0 ? "<+0.06" : `<+${operational.staggerStep}`
      );
    });

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.element, operational.toneActiveTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.activeTo, "<");

    operational.items.forEach((item, index) => {
      addElementTween(masterTimeline, item, null, operational.itemActiveToFactory(index), "<");
    });

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.element, operational.toneExitTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.exitTo, "<");

    operational.items.forEach((item, index) => {
      addElementTween(masterTimeline, item, null, operational.itemExitToFactory(index), "<");
    });

    addSceneShift(masterTimeline, scene.index, isLastScene);
  }

  function addPlanningSceneSlot(masterTimeline, scene, isLastScene) {
    const planning = scene.planningReveal;
    const planningPieces = planning.flow.pieces || [];
    const planningTimelineSlots = planning.flow.timelineSlots || [];

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(scene.element, planning.atmosphereFrom, planning.atmosphereTo);

    addDepthTween(
      masterTimeline,
      scene.layers.background.target,
      scene.depth.background.enterFrom,
      scene.depth.background.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.midground.target,
      scene.depth.midground.enterFrom,
      scene.depth.midground.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.foreground.target,
      scene.depth.foreground.enterFrom,
      scene.depth.foreground.enterTo,
      "<"
    );

    addElementTween(masterTimeline, planning.heading, planning.headingFrom, planning.headingTo, "<+0.04");
    addElementTween(masterTimeline, planning.subtitle, planning.subtitleFrom, planning.subtitleTo, "<+0.07");
    addElementTween(
      masterTimeline,
      planning.flow.sourceCard,
      planning.sourceCardFrom,
      planning.sourceCardTo,
      "<+0.08"
    );

    planningPieces.forEach((piece, index) => {
      addElementTween(
        masterTimeline,
        piece,
        planning.pieceFromFactory(index),
        planning.pieceToFactory(),
        index === 0 ? "<+0.09" : `<+${planning.pieceStagger}`
      );
    });

    planningTimelineSlots.forEach((slot, index) => {
      addElementTween(
        masterTimeline,
        slot,
        planning.timelineSlotFromFactory(index),
        planning.timelineSlotToFactory(),
        index === 0 ? "<+0.08" : `<+${planning.timelineStagger}`
      );
    });

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.element, planning.atmosphereActiveTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.activeTo, "<");

    addElementTween(masterTimeline, planning.flow.sourceCard, null, planning.sourceCardActiveTo, "<");

    planningPieces.forEach((piece, index) => {
      addElementTween(masterTimeline, piece, null, planning.pieceActiveToFactory(index), "<");
    });

    planningTimelineSlots.forEach((slot, index) => {
      addElementTween(masterTimeline, slot, null, planning.timelineSlotActiveToFactory(index), "<");
    });

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.element, planning.atmosphereExitTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.exitTo, "<");

    addElementTween(masterTimeline, planning.flow.sourceCard, null, planning.sourceCardExitTo, "<");

    planningPieces.forEach((piece) => {
      addElementTween(masterTimeline, piece, null, planning.pieceExitToFactory(), "<");
    });

    planningTimelineSlots.forEach((slot, index) => {
      addElementTween(masterTimeline, slot, null, planning.timelineSlotExitToFactory(index), "<");
    });

    addSceneShift(masterTimeline, scene.index, isLastScene);
  }

  function addIntakeSceneSlot(masterTimeline, scene, isLastScene) {
    const intake = scene.intakeReveal;
    const intakeSteps = [intake.flow.request, intake.flow.processing, intake.flow.card].filter(Boolean);

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(scene.element, intake.atmosphereFrom, intake.atmosphereTo);

    addDepthTween(
      masterTimeline,
      scene.layers.background.target,
      scene.depth.background.enterFrom,
      scene.depth.background.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.midground.target,
      scene.depth.midground.enterFrom,
      scene.depth.midground.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.foreground.target,
      scene.depth.foreground.enterFrom,
      scene.depth.foreground.enterTo,
      "<"
    );

    addElementTween(masterTimeline, intake.heading, intake.headingFrom, intake.headingTo, "<+0.04");
    addElementTween(masterTimeline, intake.subtitle, intake.subtitleFrom, intake.subtitleTo, "<+0.07");

    intakeSteps.forEach((step, index) => {
      addElementTween(
        masterTimeline,
        step,
        intake.stepFromFactory(index),
        intake.stepToFactory(),
        index === 0 ? "<+0.08" : `<+${intake.stepStagger}`
      );
    });

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.element, intake.atmosphereActiveTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.activeTo, "<");

    addElementTween(masterTimeline, intake.heading, null, {
      autoAlpha: 1,
      y: -2,
      duration: CONFIG.phaseDuration.active,
      ease: "none",
      overwrite: "auto",
    }, "<");

    addElementTween(masterTimeline, intake.subtitle, null, {
      autoAlpha: 1,
      y: -1.5,
      duration: CONFIG.phaseDuration.active,
      ease: "none",
      overwrite: "auto",
    }, "<");

    intakeSteps.forEach((step) => {
      addElementTween(masterTimeline, step, null, intake.stepActiveToFactory(), "<");
    });

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.element, intake.atmosphereExitTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.exitTo, "<");

    intakeSteps.forEach((step, index) => {
      addElementTween(masterTimeline, step, null, intake.stepExitToFactory(index), "<");
    });

    addSceneShift(masterTimeline, scene.index, isLastScene);
  }

  function addAiActivationSceneSlot(masterTimeline, scene, isLastScene) {
    const activation = scene.aiActivationReveal;

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(scene.element, activation.atmosphereFrom, activation.atmosphereTo);

    addDepthTween(
      masterTimeline,
      scene.layers.background.target,
      scene.depth.background.enterFrom,
      scene.depth.background.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.midground.target,
      scene.depth.midground.enterFrom,
      scene.depth.midground.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.foreground.target,
      scene.depth.foreground.enterFrom,
      scene.depth.foreground.enterTo,
      "<"
    );

    activation.items.forEach((item, index) => {
      addElementTween(
        masterTimeline,
        item,
        activation.itemFromFactory(index),
        activation.itemToFactory(),
        index === 0 ? "<+0.06" : `<+${activation.staggerStep}`
      );
    });

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.element, activation.atmosphereActiveTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.activeTo, "<");

    activation.items.forEach((item, index) => {
      addElementTween(masterTimeline, item, null, activation.itemActiveToFactory(index), "<");
    });

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.element, activation.atmosphereExitTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.exitTo, "<");

    activation.items.forEach((item) => {
      addElementTween(masterTimeline, item, null, activation.itemExitToFactory(), "<");
    });

    addSceneShift(masterTimeline, scene.index, isLastScene);
  }

  function addProblemsSceneSlot(masterTimeline, scene, isLastScene) {
    const problems = scene.problemsReveal;

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(scene.element, problems.toneFrom, problems.toneTo);

    addDepthTween(
      masterTimeline,
      scene.layers.background.target,
      scene.depth.background.enterFrom,
      scene.depth.background.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.midground.target,
      scene.depth.midground.enterFrom,
      scene.depth.midground.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.foreground.target,
      scene.depth.foreground.enterFrom,
      scene.depth.foreground.enterTo,
      "<"
    );

    problems.items.forEach((item, index) => {
      addElementTween(
        masterTimeline,
        item,
        problems.itemFromFactory(index),
        problems.itemToFactory(),
        index === 0 ? "<+0.06" : `<+${problems.staggerStep}`
      );
    });

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.element, problems.toneActiveTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.activeTo, "<");

    problems.items.forEach((item) => {
      addElementTween(masterTimeline, item, null, problems.itemActiveToFactory(), "<");
    });

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.element, problems.toneExitTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.exitTo, "<");

    problems.items.forEach((item, index) => {
      addElementTween(masterTimeline, item, null, problems.itemExitToFactory(index), "<");
    });

    addSceneShift(masterTimeline, scene.index, isLastScene);
  }

  function addHeroSceneSlot(masterTimeline, scene, isLastScene) {
    const hero = scene.heroReveal;

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(scene.element, hero.lightFrom, hero.lightTo);

    addDepthTween(
      masterTimeline,
      scene.layers.background.target,
      scene.depth.background.enterFrom,
      scene.depth.background.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.midground.target,
      scene.depth.midground.enterFrom,
      scene.depth.midground.enterTo,
      "<"
    );
    addDepthTween(
      masterTimeline,
      scene.layers.foreground.target,
      scene.depth.foreground.enterFrom,
      scene.depth.foreground.enterTo,
      "<"
    );

    addElementTween(masterTimeline, hero.heading, hero.headingFrom, hero.headingTo, "<+0.04");
    addElementTween(masterTimeline, hero.subtitle, hero.subtitleFrom, hero.subtitleTo, "<+0.08");
    addElementTween(masterTimeline, hero.cta, hero.ctaFrom, hero.ctaTo, "<+0.1");

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.element, hero.lightActiveTo);

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.activeTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.activeTo, "<");

    addElementTween(masterTimeline, hero.heading, null, {
      autoAlpha: 1,
      yPercent: -1,
      scale: 1,
      duration: CONFIG.phaseDuration.active,
      ease: "none",
      overwrite: "auto",
    }, "<");

    addElementTween(masterTimeline, hero.subtitle, null, {
      autoAlpha: 1,
      yPercent: -0.4,
      scale: 1,
      duration: CONFIG.phaseDuration.active,
      ease: "none",
      overwrite: "auto",
    }, "<");

    addElementTween(masterTimeline, hero.cta, null, {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      duration: CONFIG.phaseDuration.active,
      ease: "none",
      overwrite: "auto",
    }, "<");

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.element, hero.lightExitTo);
    addElementTween(masterTimeline, hero.cta, null, hero.ctaExitTo, "<");

    addDepthTween(masterTimeline, scene.layers.background.target, null, scene.depth.background.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.midground.target, null, scene.depth.midground.exitTo, "<");
    addDepthTween(masterTimeline, scene.layers.foreground.target, null, scene.depth.foreground.exitTo, "<");

    addSceneShift(masterTimeline, scene.index, isLastScene);
  }

  function addSceneShift(masterTimeline, sceneIndex, isLastScene) {
    if (!isLastScene) {
      masterTimeline.to(
        state.sections,
        {
          yPercent: -100 * (sceneIndex + 1),
          duration: CONFIG.phaseDuration.exit,
          ease: "none",
        },
        "<"
      );
      return;
    }

    masterTimeline.to({}, { duration: CONFIG.phaseDuration.exit });
  }

  function addElementTween(timeline, target, fromVars, toVars, position) {
    if (!target || !toVars) {
      return;
    }

    if (fromVars) {
      timeline.fromTo(target, fromVars, toVars, position);
      return;
    }

    timeline.to(target, toVars, position);
  }

  function addDepthTween(timeline, target, fromVars, toVars, position) {
    addElementTween(timeline, target, fromVars, toVars, position);
  }

  function destroyTimeline() {
    if (!state.masterTimeline) {
      return;
    }

    if (state.masterTimeline.scrollTrigger) {
      state.masterTimeline.scrollTrigger.kill();
    }

    state.masterTimeline.kill();
    state.masterTimeline = null;
  }

  function getSceneProgress(sceneIndex) {
    if (!state.masterTimeline || state.masterTimeline.duration() === 0) {
      return 0;
    }

    const scene = state.scenes[sceneIndex];
    if (!scene) {
      return 0;
    }

    const labelTime = state.masterTimeline.labels[scene.labels.enter];
    if (typeof labelTime !== "number") {
      return 0;
    }

    return labelTime / state.masterTimeline.duration();
  }

  function getActiveSceneIndexFromTimeline() {
    if (!state.masterTimeline || state.scenes.length === 0) {
      return 0;
    }

    const labels = state.masterTimeline.labels;
    const currentTime = state.masterTimeline.time();
    let resolvedIndex = 0;

    for (let index = 0; index < state.scenes.length; index += 1) {
      const scene = state.scenes[index];
      const enterTime = labels[scene.labels.enter];

      if (typeof enterTime !== "number") {
        continue;
      }

      if (currentTime < enterTime) {
        break;
      }

      const nextScene = state.scenes[index + 1];
      if (!nextScene) {
        resolvedIndex = index;
        break;
      }

      const nextEnterTime = labels[nextScene.labels.enter];
      if (typeof nextEnterTime !== "number" || currentTime < nextEnterTime) {
        resolvedIndex = index;
        break;
      }

      resolvedIndex = index + 1;
    }

    return Math.min(state.scenes.length - 1, Math.max(0, resolvedIndex));
  }

  function buildMasterTimeline() {
    destroyTimeline();
    cacheDom();
    applyRuntimeProfile();

    if (!state.root || state.sections.length === 0) {
      return;
    }

    buildSceneModules();
    prepareSceneBaseStates();

    gsap.set(state.sections, {
      yPercent: 0,
      force3D: true,
    });

    if (state.scenes.length > 0) {
      runScenePhase(state.scenes[0], "active");
    }

    state.masterTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "master-scroll-timeline",
        trigger: state.root,
        start: "top top",
        end: () => `+=${window.innerHeight * state.scenes.length}`,
        pin: true, // Sticky container logic for cinematic scroll foundation.
        scrub: CONFIG.scrub,
        markers: CONFIG.debugMarkers,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        anticipatePin: 1,
        onUpdate: () => {
          setActiveSection(getActiveSceneIndexFromTimeline());
        },
      },
    });

    state.scenes.forEach((scene) => {
      scene.element.setAttribute("data-slot", String(scene.index + 1));
      addSceneSlot(state.masterTimeline, scene);
    });
  }

  function handleNavClick(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !state.masterTimeline || !state.masterTimeline.scrollTrigger) {
      return;
    }

    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const targetSection = state.root.querySelector(targetId);
    if (!targetSection) {
      return;
    }

    const targetIndex = state.sections.indexOf(targetSection);
    if (targetIndex < 0) {
      return;
    }

    event.preventDefault();

    const progress = getSceneProgress(targetIndex);
    const trigger = state.masterTimeline.scrollTrigger;
    const scrollTarget = trigger.start + (trigger.end - trigger.start) * progress;

    window.scrollTo({
      top: scrollTarget,
      behavior: state.runtimeProfile && state.runtimeProfile.useInstantNavScroll ? "auto" : "smooth",
    });
  }

  function bindEvents() {
    state.navList = document.querySelector(".nav-list");
    if (state.navList) {
      state.navList.addEventListener("click", handleNavClick);
      syncNavActiveItem(state.activeSectionIndex);
    }

    state.onResize = () => {
      if (state.resizeTimer) {
        window.clearTimeout(state.resizeTimer);
      }

      state.resizeTimer = window.setTimeout(() => {
        buildMasterTimeline();
        ScrollTrigger.refresh();
      }, 200);
    };

    window.addEventListener("resize", state.onResize);
  }

  function unbindEvents() {
    if (state.navList) {
      state.navList.removeEventListener("click", handleNavClick);
      state.navList = null;
    }

    if (state.onResize) {
      window.removeEventListener("resize", state.onResize);
      state.onResize = null;
    }

    if (state.resizeTimer) {
      window.clearTimeout(state.resizeTimer);
      state.resizeTimer = null;
    }
  }

  function init() {
    if (!hasEngineDependencies()) {
      // Fallback to native scroll if GSAP assets fail to load.
      return false;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({
      ignoreMobileResize: true,
      limitCallbacks: true,
    });

    buildMasterTimeline();
    bindEvents();
    return true;
  }

  const initialized = init();

  return () => {
    unbindEvents();
    destroyTimeline();

    if (initialized) {
      ScrollTrigger.clearScrollMemory();
    }
  };
}

