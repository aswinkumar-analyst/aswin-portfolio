import { useCallback } from "react";
import { planeFacets } from "../config/contact";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/utils";

// flyPlane(): the form lifts away, a sheet folds into a plane and it flies off
// the right edge. `onDone` always fires, so the success message still appears
// for reduced motion or if the animation throws.
export function useContactMotion(root) {
  const { contextSafe } = useGSAP({ scope: root });

  const flyPlane = useCallback(
    (onDone) => {
      if (prefersReducedMotion()) return onDone();

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
