import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

// The hero this section slides over (see HeroSection, id="top").
const HERO = "#top";

// Scroll choreography for the About section, all scrubbed so it follows the
// scrollbar exactly:
//   1. The hero pins (pinSpacing off) while About slides up over it, and the
//      hero shrinks and dims behind the incoming card.
//   2. The statement's words go from muted to full ink in reading order.
// With prefers-reduced-motion nothing is pinned or scrubbed; the statement
// simply shows in full ink.
export function useAboutScroll(scope) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const hero = document.querySelector(HERO);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          small: "(max-width: 480px)",
        },
        (ctx) => {
        const { motion, small } = ctx.conditions;
        if (!motion) return;

        if (hero) {
          gsap.to(hero, {
            scale: 0.9,
            opacity: 0.5,
            ease: "none",
            transformOrigin: "50% 100%",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 1,
              pin: true,
              pinSpacing: false,
            },
          });
        }

        // The statement block pins near the top for one screen of scroll.
        const pinTrigger = q("[data-pin]")[0];
        const pin = ScrollTrigger.create({
          trigger: pinTrigger,
          start: "top 8%",
          // Small phones: the statement wraps to many lines, so a full
          // screen of scroll feels long. Pin for less than half of that.
          end: small ? "+=65%" : "+=160%",
          pin: true,
        });

        gsap.fromTo(
          q("[data-char]"),
          { opacity: 0.26 },
          {
            opacity: 1,
            ease: "none",
            duration: 0.08,
            // Character by character in reading order. Each fade (0.08) spans
            // ~4 gaps (0.02), so only ~4 characters are mid-fade at once: a
            // tight gradient edge, under one word wide, sweeping through the
            // text. Opacity only, so it stays on the compositor.
            stagger: 0.02,
            scrollTrigger: {
              trigger: pinTrigger,
              // Starts once the block is 40% into the viewport (before it
              // pins) and finishes exactly when the pin releases.
              start: small ? "top 75%" : "top 60%",
              end: () => pin.end,
              scrub: small ? 0.6 : 1.2,
            },
          },
        );
        },
      );

      return () => mm.revert();
    },
    { scope },
  );
}
