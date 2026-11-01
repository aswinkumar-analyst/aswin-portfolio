// Work section copy and projects. Edit, add or remove entries here; components only render it.
// The entries below are PLACEHOLDERS: swap in real titles, links and images.
//
// Project fields:
//   id, title, client       client is the subtitle line above the title
//   description             keep it to ~2 lines, the card clamps it
//   tags                    short chips (stack / discipline)
//   link                    case study or repo URL, opens in a new tab
//   image                   optional: import an image (or a /public path) and it replaces the
//                           generated art. Leave null to use `art`.
//   art                     generated cover when there is no image:
//                           shape = rings | grid | waves | nodes | bars | orbit
//                           from / to = gradient corners, accent = line colour
//
// Keep at least 6 projects so the infinite loop never shows a gap on wide screens.

export const workCopy = {
  eyebrow: "Selected work",
  headline: "Selected work & case studies",
  summary:
    "Agents, retrieval systems and automations I have taken from first prototype to production, with the evals and plumbing that keep them reliable.",
};

export const projects = [
  {
    id: "support-desk-agent",
    title: "Support Desk Agent",
    client: "SaaS helpdesk",
    description:
      "A tool-using agent that triages tickets, drafts replies from the knowledge base and escalates the hard ones.",
    tags: ["Claude", "LangChain", "FastAPI"],
    link: "https://example.com/case-studies/support-desk-agent",
    image: null,
    art: { shape: "rings", from: "#0f68a6", to: "#081f36", accent: "#9fd3f5" },
  },
  {
    id: "doc-intelligence",
    title: "Document Intelligence",
    client: "Legal & finance ops",
    description:
      "Retrieval pipeline over thousands of contracts with cited answers, chunking tuned per document type.",
    tags: ["RAG", "Vector DB", "Python"],
    link: "https://example.com/case-studies/document-intelligence",
    image: null,
    art: { shape: "grid", from: "#0b4f82", to: "#06182b", accent: "#7cc4f0" },
  },
  {
    id: "lead-pipeline",
    title: "Lead Routing Pipeline",
    client: "B2B sales team",
    description:
      "n8n workflows that enrich, score and route inbound leads in seconds instead of hours.",
    tags: ["n8n", "Automation", "PostgreSQL"],
    link: "https://example.com/case-studies/lead-pipeline",
    image: null,
    art: { shape: "nodes", from: "#1f7fb8", to: "#0a2b46", accent: "#f4e9d0" },
  },
  {
    id: "voice-receptionist",
    title: "Voice Receptionist",
    client: "Clinic network",
    description:
      "A phone agent that books, reschedules and answers questions, handing off to staff when unsure.",
    tags: ["Voice AI", "OpenAI", "Telephony"],
    link: "https://example.com/case-studies/voice-receptionist",
    image: null,
    art: { shape: "waves", from: "#0f68a6", to: "#024b75", accent: "#d6e8f7" },
  },
  {
    id: "eval-harness",
    title: "LLM Eval Harness",
    client: "Internal tooling",
    description:
      "Regression suite that scores prompts and models on every change, so quality drift shows up before users see it.",
    tags: ["Evals", "MLOps", "Docker"],
    link: "https://example.com/case-studies/eval-harness",
    image: null,
    art: { shape: "bars", from: "#123a5c", to: "#050f1a", accent: "#6db7e6" },
  },
  {
    id: "content-ops",
    title: "Content Ops Engine",
    client: "Media studio",
    description:
      "Brief-to-publish automation: research, draft, review and schedule, with a human approving every step that matters.",
    tags: ["Agents", "React", "Prompt Design"],
    link: "https://example.com/case-studies/content-ops",
    image: null,
    art: { shape: "orbit", from: "#2a8ac4", to: "#0a3a5f", accent: "#ffffff" },
  },
];
