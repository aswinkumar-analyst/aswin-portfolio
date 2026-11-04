export const pad2 = (n) => String(n).padStart(2, "0");

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
