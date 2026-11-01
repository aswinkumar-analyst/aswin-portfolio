import { gsap, useGSAP } from "../lib/gsap";

// Seconds the sky, birds, plane and nav have the stage to themselves.
const REVEAL_DELAY = 1.5;

// Timed entrance: after REVEAL_DELAY the headline lines rise in one by one,
// then the subtext and CTAs. Only transform and opacity are animated, so the
// reveal stays on the compositor. autoAlpha also flips visibility, which keeps
// the hidden CTAs out of the tab order until they appear.
//
// useGSAP wraps everything in a gsap.context, so the tweens are reverted on
// unmount. With prefers-reduced-motion the copy is simply shown.
export function useHeroReveal(scope) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            delay: REVEAL_DELAY,
            defaults: { ease: "power3.out", immediateRender: true },
          })
          .from(q('[data-hero="headline-line"]'), {
            yPercent: 60,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.15,
          })
          .from(
            q('[data-hero="subtext"], [data-hero="ctas"]'),
            { y: 32, autoAlpha: 0, duration: 0.8, stagger: 0.12 },
            "<0.45",
          );
      });

      return () => mm.revert();
    },
    { scope },
  );
}
