import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { scrollToHash, setLenis } from "../lib/scroll";

// Page-wide inertial smooth scroll. Lenis drives the scroll position and
// ScrollTrigger is updated on every Lenis scroll event, with Lenis ticked from
// GSAP's ticker so both share one frame loop. Skipped for reduced motion.
// In-page "#" links are routed through scrollToHash (see lib/scroll).
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
    });
    setLenis(lenis);

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
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // One delegated listener for every in-page link (nav, menu, CTAs, hero).
    // Modified clicks (new tab etc.) are left to the browser.
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href^="#"]');
      if (link && scrollToHash(link.getAttribute("href"))) event.preventDefault();
    };
    document.addEventListener("click", onClick);

    // Deep link (/#work): the sections and pins don't exist when the browser
    // tries its own jump, so land on the hash once the boot screen is done.
    let active = true;
    const { hash } = window.location;
    if (hash && hash !== "#top") {
      Promise.resolve(window.__boot?.ready).then(() => {
        if (!active) return;
        ScrollTrigger.refresh();
        scrollToHash(hash, { immediate: true });
      });
    }

    return () => {
      active = false;
      document.removeEventListener("click", onClick);
    };
  }, []);
}
