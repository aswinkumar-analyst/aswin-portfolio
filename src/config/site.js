// Site copy and navigation. Edit text here; components only render it.

export const brand = {
  name: "aswin",
  href: "#top", // in-page: scrolls to the top, no reload (see lib/scroll)
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export const navCta = { label: "Get started", href: "#contact" };

export const heroCopy = {
  // Each entry renders on its own line and animates in as one unit.
  headline: ["Gen AI & ", "Automation Engineer"],
  subtext: "Building Intelligent Systems for the Future.",
  primaryCta: { label: "See selected work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "#contact" },
  // Trails behind the plane that crosses the sky.
  banner: "Available for hire | Let's build",
};
