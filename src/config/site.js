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


// Résumé download. Put the PDF at public/resume.pdf; `fileName` is what the
// visitor's device saves it as. A real link, so long-press / right-click
// "open in new tab" also works on every device.
export const resume = {
  href: "/resume.pdf",
  fileName: "Aswin-Resume.pdf",
  label: "Résumé",
};

export const heroCopy = {
  // Each entry renders on its own line and animates in as one unit.
  headline: ["Gen AI & ", "Automation Engineer"],
  subtext: "Building Intelligent Systems for the Future.",
  primaryCta: { label: "View projects", href: "#work" },
  // Trails behind the plane that crosses the sky.
  banner: "Available for hire | Let's build",
};
