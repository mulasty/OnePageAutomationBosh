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

  function createSceneModule(section, index) {
    const sceneId = section.id || `scene-${index + 1}`;
    const content = section.querySelector(".panel-content") || section;

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
      motion: {
        target: content,
        enterFrom: {
          autoAlpha: 0.35,
          yPercent: 5,
          scale: 0.992,
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
          yPercent: -2,
          scale: 0.996,
          duration: CONFIG.phaseDuration.exit,
          ease: "power1.inOut",
          overwrite: "auto",
        },
      },
    };
  }

  function buildSceneModules() {
    state.scenes = state.sections.map((section, index) => createSceneModule(section, index));
  }

  function prepareSceneBaseStates() {
    state.scenes.forEach((scene, index) => {
      window.gsap.set(scene.motion.target, {
        autoAlpha: index === 0 ? 1 : scene.motion.enterFrom.autoAlpha,
        yPercent: index === 0 ? 0 : scene.motion.enterFrom.yPercent,
        scale: index === 0 ? 1 : scene.motion.enterFrom.scale,
        transformOrigin: "50% 50%",
        force3D: true,
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

    masterTimeline.addLabel(scene.labels.enter);
    masterTimeline.call(() => runScenePhase(scene, "enter"), null, ">");
    masterTimeline.fromTo(
      scene.motion.target,
      scene.motion.enterFrom,
      scene.motion.enterTo
    );

    masterTimeline.addLabel(scene.labels.active);
    masterTimeline.call(() => runScenePhase(scene, "active"), null, ">");
    masterTimeline.to(scene.motion.target, scene.motion.activeTo);

    masterTimeline.addLabel(scene.labels.exit);
    masterTimeline.call(() => runScenePhase(scene, "exit"), null, ">");
    masterTimeline.to(scene.motion.target, scene.motion.exitTo);

    if (!isLastScene) {
      masterTimeline.to(state.sections, {
        yPercent: -100 * (scene.index + 1),
        duration: CONFIG.phaseDuration.exit,
        ease: "none",
      }, "<");
      return;
    }

    masterTimeline.to({}, { duration: CONFIG.phaseDuration.exit });
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
