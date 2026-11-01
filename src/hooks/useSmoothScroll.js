import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";

// Page-wide inertial smooth scroll. Lenis drives the scroll position and
// ScrollTrigger is updated on every Lenis scroll event, with Lenis ticked from
// GSAP's ticker so both share one frame loop. Skipped for reduced motion.
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Soft glide + slightly damped wheel: each notch travels ~75% as far and
      // takes ~1.6s to settle, so a hard flick can't skip past the content.
      duration: 1.6,
      wheelMultiplier: 0.75,
      touchMultiplier: 1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      anchors: { duration: 2 },
    });

    // Hold the page still behind the boot screen (see public/loader.js).
    if (window.__boot) {
      lenis.stop();
      window.__boot.ready.then(() => lenis.start());
    }

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}
