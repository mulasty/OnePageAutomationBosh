"use strict";

(() => {
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
  };

  function hasEngineDependencies() {
    return typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
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
    cta.textContent = "[Placeholder: Hero CTA]";
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

  function createSceneModule(section, index) {
    const sceneId = section.id || `scene-${index + 1}`;
    const content = section.querySelector(".panel-content") || section;
    const layers = resolveSceneLayers(content);
    const isHero = sceneId === "hero";
    const isProblems = sceneId === "problems";
    const heroReveal = isHero ? createHeroRevealConfig(content) : null;
    const problemsReveal = isProblems ? createProblemsRevealConfig(content) : null;

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
      layers,
      motion: {
        target: isHero || isProblems ? content : layers.foreground.target || content,
        enterFrom: {
          autoAlpha: isHero || isProblems ? 1 : 0.35,
          yPercent: 0,
          scale: isHero || isProblems ? 1 : 0.992,
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
        window.gsap.set(scene.element, {
          "--hero-light": 0,
          "--hero-darkness": 1,
        });

        if (scene.heroReveal.heading) {
          window.gsap.set(scene.heroReveal.heading, {
            ...scene.heroReveal.headingFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        if (scene.heroReveal.subtitle) {
          window.gsap.set(scene.heroReveal.subtitle, {
            ...scene.heroReveal.subtitleFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }

        if (scene.heroReveal.cta) {
          window.gsap.set(scene.heroReveal.cta, {
            ...scene.heroReveal.ctaFrom,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        }
      }

      if (scene.isProblems && scene.problemsReveal) {
        window.gsap.set(scene.element, {
          "--problems-darkness": 1,
          "--problems-accent": 0.65,
        });

        scene.problemsReveal.items.forEach((item, index) => {
          window.gsap.set(item, {
            ...scene.problemsReveal.itemFromFactory(index),
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      }

      window.gsap.set(scene.motion.target, {
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

        window.gsap.set(layer.target, {
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

  function buildMasterTimeline() {
    destroyTimeline();
    cacheDom();

    if (!state.root || state.sections.length === 0) {
      return;
    }

    buildSceneModules();
    prepareSceneBaseStates();

    window.gsap.set(state.sections, {
      yPercent: 0,
      force3D: true,
    });

    if (state.scenes.length > 0) {
      runScenePhase(state.scenes[0], "active");
    }

    state.masterTimeline = window.gsap.timeline({
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
        onUpdate: (self) => {
          const nextIndex = Math.min(
            state.scenes.length - 1,
            Math.floor(self.progress * state.scenes.length)
          );
          setActiveSection(nextIndex);
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
      behavior: "smooth",
    });
  }

  function bindEvents() {
    const navList = document.querySelector(".nav-list");
    if (navList) {
      navList.addEventListener("click", handleNavClick);
    }

    window.addEventListener("resize", () => {
      if (state.resizeTimer) {
        window.clearTimeout(state.resizeTimer);
      }

      state.resizeTimer = window.setTimeout(() => {
        buildMasterTimeline();
        window.ScrollTrigger.refresh();
      }, 200);
    });
  }

  function init() {
    if (!hasEngineDependencies()) {
      // Fallback to native scroll if GSAP assets fail to load.
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    buildMasterTimeline();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
