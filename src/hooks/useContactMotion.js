import { useCallback } from "react";
import { planeFacets } from "../config/contact";
import { gsap, useGSAP } from "../lib/gsap";

const REDUCED = "(prefers-reduced-motion: reduce)";

// Section entrance, plus flyPlane(): the form lifts away, a sheet folds into a
// plane and it flies off the right edge. `onDone` always fires, so the success
// message still appears for reduced motion or if the animation throws.
export function useContactMotion(root) {
  // Headline words rise out of masks, the rest fades up (same as Work).
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
          stagger: 0.08,
          delay: 0.25,
          scrollTrigger,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const { contextSafe } = useGSAP({ scope: root });

  const flyPlane = useCallback(
    (onDone) => {
      if (window.matchMedia(REDUCED).matches) return onDone();

      const play = contextSafe(() => {
        const q = gsap.utils.selector(root);
        const plane = q("[data-plane]")[0];
        const facets = q("[data-facet]");
        // Far enough to leave the viewport from wherever the form sits.
        const { left, width } = plane.getBoundingClientRect();
        const exitX = window.innerWidth - left + width;

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(plane, { clearProps: "all" });
            facets.forEach((facet, i) => facet.setAttribute("points", planeFacets[i].sheet));
            onDone();
          },
        });

        tl.to(q("[data-field]"), { autoAlpha: 0, y: -12, duration: 0.3, ease: "power2.in", stagger: 0.03 })
          .set(plane, { autoAlpha: 1, scale: 0.7 })
          .to(plane, { scale: 1, duration: 0.3, ease: "power3.out" })
          .to(
            facets,
            {
              attr: { points: (i) => planeFacets[i].plane },
              duration: 0.55,
              ease: "power3.inOut",
              stagger: 0.05,
            },
            "+=0.05",
          )
          // A small wind-up against the throw, then the arc out.
          .to(plane, { x: -14, y: 10, rotation: -6, duration: 0.22, ease: "sine.out" })
          .to(plane, { x: exitX, duration: 0.85, ease: "power2.in" })
          .to(plane, { y: -200, rotation: -14, duration: 0.85, ease: "sine.inOut" }, "<");
      });

      try {
        play();
      } catch {
        onDone();
      }
    },
    [contextSafe, root],
  );

  return flyPlane;
}
