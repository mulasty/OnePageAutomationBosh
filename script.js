"use strict";

(() => {
  const CONFIG = {
    rootSelector: "#scroll-root",
    sectionSelector: ".panel",
    scrub: 1.2,
    debugMarkers: false, // Set true to enable ScrollTrigger markers during debug.
  };

  const state = {
    root: null,
    sections: [],
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

  function addSectionSlot(masterTimeline, section, index, sections) {
    const sectionName = section.id || `section-${index + 1}`;

    masterTimeline.addLabel(`${sectionName}-start`);
    masterTimeline.call(() => setActiveSection(index), null, ">");

    // Placeholder hook for section-specific animations in future prompts.
    masterTimeline.call(() => {}, null, ">");

    if (index < sections.length - 1) {
      masterTimeline.to(sections, {
        yPercent: -100 * (index + 1),
        duration: 1,
        ease: "none",
      });
    } else {
      masterTimeline.to({}, { duration: 1 });
    }

    masterTimeline.addLabel(`${sectionName}-end`);
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

  function buildMasterTimeline() {
    destroyTimeline();
    cacheDom();

    if (!state.root || state.sections.length === 0) {
      return;
    }

    window.gsap.set(state.sections, {
      yPercent: 0,
      force3D: true,
    });

    setActiveSection(0);

    state.masterTimeline = window.gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "master-scroll-timeline",
        trigger: state.root,
        start: "top top",
        end: () => `+=${window.innerHeight * state.sections.length}`,
        pin: true, // Sticky container logic for cinematic scroll foundation.
        scrub: CONFIG.scrub,
        markers: CONFIG.debugMarkers,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const nextIndex = Math.min(
            state.sections.length - 1,
            Math.floor(self.progress * state.sections.length)
          );
          setActiveSection(nextIndex);
        },
      },
    });

    state.sections.forEach((section, index) => {
      section.setAttribute("data-slot", String(index + 1));
      addSectionSlot(state.masterTimeline, section, index, state.sections);
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

    const progress = targetIndex / Math.max(state.sections.length - 1, 1);
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
