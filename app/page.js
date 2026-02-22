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
    title: "Turn Service Chaos into Scheduled Revenue",
    level: 1,
    placeholder:
      "Bosch-ready AI captures every inquiry, triages urgency, and turns inbound demand into predictable booked jobs.",
  },
  {
    id: "problems",
    title: "Leads leak before they reach your team",
    level: 2,
    placeholder:
      "Phone overload, manual triage, and delayed callbacks create 2-4 hour response gaps that turn high-intent drivers into lost revenue.",
  },
  {
    id: "ai-activation",
    title: "Go live in 24 hours, not 8 weeks",
    level: 2,
    placeholder:
      "Connect forms, WhatsApp, and CRM once. Automation starts classifying requests immediately and routes qualified work to advisors.",
  },
  {
    id: "intake",
    title: "Capture every request in under 15 seconds",
    level: 2,
    placeholder:
      "Every request is captured, classified, and enriched with vehicle context automatically. Intake admin time can drop by up to 60%.",
  },
  {
    id: "planning",
    title: "Fill empty slots with margin-first planning",
    level: 2,
    placeholder:
      "Jobs are prioritized by urgency, parts readiness, and team capacity. Idle bay time can be reduced by up to 35%.",
  },
  {
    id: "parts",
    title: "Prepare parts and pricing before first callback",
    level: 2,
    placeholder:
      "Required parts and quote ranges are prepared upfront. Approval loops can be shortened by up to 40% and jobs start sooner.",
  },
  {
    id: "communication",
    title: "Cut status calls while increasing trust",
    level: 2,
    placeholder:
      "Customers receive instant confirmations, ETA updates, and pickup notifications. Inbound 'status?' calls can drop by up to 50%.",
  },
  {
    id: "command-center",
    title: "Control SLA risk from one command view",
    level: 2,
    placeholder:
      "One dashboard tracks queue health, technician load, pending approvals, and SLA risk in real time with auditable event history.",
  },
  {
    id: "transformation",
    title: "Before: reactive firefighting. After: predictable throughput.",
    level: 2,
    placeholder:
      "Before AI: delayed callbacks and idle slots. After AI: faster response, higher utilization, and calmer execution hour by hour.",
  },
  {
    id: "cta",
    title: "Book Your 30-Minute AI Revenue Blueprint",
    level: 2,
    placeholder:
      "Receive a 14-day rollout plan with projected response-time and utilization gains for your workshop. No system rebuild required.",
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
