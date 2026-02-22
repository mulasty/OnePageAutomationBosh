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
  {
    id: "hero",
    title: "Bosch Service. Rebuilt by AI.",
    level: 1,
    placeholder:
      "From workshop chaos to fully coordinated service flow. One scroll shows the full transformation.",
  },
  {
    id: "problems",
    title: "What breaks growth today",
    level: 2,
    placeholder:
      "Phone overload, manual triage, and delayed updates create 2-4 hour response gaps and lost jobs.",
  },
  {
    id: "ai-activation",
    title: "AI activates in one day",
    level: 2,
    placeholder:
      "Connect forms, WhatsApp, and CRM in one orchestration layer. First automated flows launch in under 24h.",
  },
  {
    id: "intake",
    title: "Intake without bottlenecks",
    level: 2,
    placeholder:
      "Every request is captured, classified, and enriched automatically. Intake admin time drops by up to 60%.",
  },
  {
    id: "planning",
    title: "Planning that fills the day",
    level: 2,
    placeholder:
      "Jobs are prioritized by urgency, parts readiness, and team capacity. Empty slots can be reduced by up to 35%.",
  },
  {
    id: "parts",
    title: "Parts + pricing, prepared early",
    level: 2,
    placeholder:
      "Required parts and quote ranges are prepared before contact. Approval cycles can be shortened by up to 40%.",
  },
  {
    id: "communication",
    title: "Status communication on autopilot",
    level: 2,
    placeholder:
      "Customers receive instant confirmations, ETA updates, and pickup notifications. Inbound status calls can drop by up to 50%.",
  },
  {
    id: "command-center",
    title: "Command Center view",
    level: 2,
    placeholder:
      "One dashboard tracks queue health, technician load, pending approvals, and SLA risk in real time.",
  },
  {
    id: "transformation",
    title: "From reactive to predictable",
    level: 2,
    placeholder:
      "The workshop runs with fewer delays, faster customer response, and clear operational visibility every hour.",
  },
  {
    id: "cta",
    title: "Launch the Bosch AI flow",
    level: 2,
    placeholder:
      "Book a 30-minute automation blueprint and receive a 14-day rollout plan for your service operation.",
  },
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
