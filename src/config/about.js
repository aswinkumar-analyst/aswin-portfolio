// About section copy and skills. Edit text and items here; components only render it.
import {
  siClaude,
  siDocker,
  siFastapi,
  siLangchain,
  siN8n,
  siPostgresql,
  siPython,
  siReact,
} from "simple-icons";

export const aboutCopy = {
  eyebrow: "About",
  // Revealed word by word as the section scrolls past.
  statement:
    "I design and ship AI systems that think, act and automate the work around them, from generative models and agents to the pipelines that keep them reliable in production.",
};

// Two marquee rows, scrolling in opposite directions. Each item is
// { label } for a plain outline chip (practices, concepts), { label, icon }
// for a glass chip with a brand logo from simple-icons, or { label, src } for
// a custom logo image (import it, or use a /public path).
export const skillRows = [
  [
    // Alternate logo / no-logo chips so the rhythm stays even.
    { label: "Python", icon: siPython },
    { label: "OpenAI" },
    { label: "LangChain", icon: siLangchain },
    { label: "RAG" },
    { label: "Claude", icon: siClaude },
    { label: "Agents" },
    { label: "FastAPI", icon: siFastapi },
    { label: "Vector DBs" },
  ],
  [
    { label: "n8n", icon: siN8n },
    { label: "Automation" },
    { label: "React", icon: siReact },
    { label: "Prompt Design" },
    { label: "Docker", icon: siDocker },
    { label: "Evals" },
    { label: "PostgreSQL", icon: siPostgresql },
    { label: "MLOps" },
  ],
];
