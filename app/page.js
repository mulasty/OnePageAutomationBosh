"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { initScrollExperience } from "./scroll-engine";

const NAV_ITEMS = [
  { id: "hero", label: "Hero" },
  { id: "problems", label: "Problems" },
  { id: "ai-activation", label: "AI Activation" },
  { id: "intake", label: "Intake" },
  { id: "planning", label: "Planning" },
  { id: "parts", label: "Parts" },
  { id: "communication", label: "Communication" },
  { id: "command-center", label: "Command Center" },
  { id: "transformation", label: "Transformation" },
  { id: "cta", label: "CTA" },
];

const SECTIONS = [
  { id: "hero", title: "Hero", level: 1, placeholder: "[Placeholder: Hero scene content]" },
  { id: "problems", title: "Problems", level: 2, placeholder: "[Placeholder: Problems content]" },
  {
    id: "ai-activation",
    title: "AI Activation",
    level: 2,
    placeholder: "[Placeholder: AI activation content]",
  },
  { id: "intake", title: "Intake", level: 2, placeholder: "[Placeholder: Intake content]" },
  { id: "planning", title: "Planning", level: 2, placeholder: "[Placeholder: Planning content]" },
  { id: "parts", title: "Parts", level: 2, placeholder: "[Placeholder: Parts content]" },
  {
    id: "communication",
    title: "Communication",
    level: 2,
    placeholder: "[Placeholder: Communication content]",
  },
  {
    id: "command-center",
    title: "Command Center",
    level: 2,
    placeholder: "[Placeholder: Command center content]",
  },
  {
    id: "transformation",
    title: "Transformation",
    level: 2,
    placeholder: "[Placeholder: Transformation content]",
  },
  { id: "cta", title: "CTA", level: 2, placeholder: "[Placeholder: Final call-to-action content]" },
];

export default function HomePage() {
  useEffect(() => {
    const cleanup = initScrollExperience();
    return cleanup;
  }, []);

  return (
    <>
      <header className="site-header">
        <nav aria-label="Section navigation">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <motion.main
        id="scroll-root"
        className="scroll-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {SECTIONS.map((section) => {
          const headingId = `${section.id}-title`;
          return (
            <section key={section.id} id={section.id} className="panel" aria-labelledby={headingId}>
              <div className="panel-content">
                {section.level === 1 ? (
                  <h1 id={headingId}>{section.title}</h1>
                ) : (
                  <h2 id={headingId}>{section.title}</h2>
                )}
                <p>{section.placeholder}</p>
              </div>
            </section>
          );
        })}
      </motion.main>
    </>
  );
}
