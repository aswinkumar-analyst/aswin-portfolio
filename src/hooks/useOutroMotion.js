import { gsap, useGSAP } from "../lib/gsap";

// Closing CTA: headline words rise out of their masks and the button fades up
// (once, same timing as Contact). The halftone sky is scrubbed to scroll: it
// rises and settles from a slight zoom as the card's last stretch comes in.
// Transforms only, on one layer, so the canvas is never redrawn while moving.
export function useOutroMotion(root) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrollTrigger = { trigger: root.current, start: "top 75%", once: true };
        gsap.from("[data-word]", { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.07, scrollTrigger });
        gsap.from("[data-outro-cta]", {
          autoAlpha: 0,
          y: 24,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.3,
          scrollTrigger,
        });

        gsap.fromTo(
          "[data-outro-sky]",
          { yPercent: 30, scale: 1.15 },
          {
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-outro-band]",
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );
}
