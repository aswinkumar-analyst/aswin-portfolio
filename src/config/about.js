// About section copy and skills. Edit text and items here; components only render it.

export const aboutCopy = {
  eyebrow: "About",
  // Revealed word by word as the section scrolls past.
  statement:
    "I design and ship AI systems that think, act and automate the work around them, from generative models and agents to the pipelines that keep them reliable in production.",
};

// Two marquee rows, scrolling in opposite directions. Each item is
// { label } for a text chip, or { label, src } to show a logo or SVG
// (import it, or use a /public path) beside the label.
export const skillRows = [
  [
    { label: "Python" },
    { label: "LangChain" },
    { label: "OpenAI" },
    { label: "Claude" },
    { label: "RAG" },
    { label: "Agents" },
    { label: "Vector DBs" },
    { label: "FastAPI" },
  ],
  [
    { label: "n8n" },
    { label: "Automation" },
    { label: "React" },
    { label: "Docker" },
    { label: "PostgreSQL" },
    { label: "Prompt Design" },
    { label: "Evals" },
    { label: "MLOps" },
  ],
];
