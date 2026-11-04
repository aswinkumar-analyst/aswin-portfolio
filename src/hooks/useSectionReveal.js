import { gsap, useGSAP } from "../lib/gsap";

// Section entrance, once: headline words (MaskedWords) rise out of their
// masks, then every [data-reveal] fades up.
export function useSectionReveal(root, { stagger = 0.08 } = {}) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrollTrigger = { trigger: root.current, start: "top 70%", once: true };
        gsap.from("[data-word]", { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.07, scrollTrigger });
        gsap.from("[data-reveal]", {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: "power3.out",
          stagger,
          delay: 0.25,
          scrollTrigger,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );
}
