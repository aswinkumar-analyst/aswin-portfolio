// In-page navigation. Every "#section" link goes through scrollToHash, which
// cuts to the section instead of scrolling through everything in between: the
// content dips under a veil (see #page-veil in App), the page jumps while it is
// covered, and the veil lifts. The nav sits above the veil and stays put.
import { gsap, ScrollTrigger } from "./gsap";

let lenis = null;
let veilTl = null;

// Set by useSmoothScroll. Stays null under reduced motion (no Lenis).
export function setLenis(instance) {
  lenis = instance;
}

// Same value the CSS uses for scroll-padding-top, so the nav offset has one source.
const navOffset = () =>
  parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

// Instant jump with every scroll animation settled at the new position, so
// scrubbed tweens (hero shrink, read-along text) don't visibly catch up.
function jumpTo(top) {
  if (!lenis) return window.scrollTo(0, top);
  lenis.scrollTo(top, { immediate: true, force: true });
  ScrollTrigger.update();
  for (const st of ScrollTrigger.getAll()) st.getTween()?.progress(1);
}

// Goes to "#id" (or to the very top for "#top" / "#"). Measures the target
// now, so pin spacers above it are already counted. Returns false when there
// is no such element, leaving the click to the browser.
export function scrollToHash(hash, { immediate = false } = {}) {
  const toTop = hash === "#" || hash === "#top";
  let top = 0;
  if (!toTop) {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return false;
    top = target.getBoundingClientRect().top + window.scrollY - navOffset();
  }

  const veil = document.getElementById("page-veil");
  if (immediate || !lenis || !veil) {
    jumpTo(top);
  } else {
    // A second click mid-transition takes over from the current veil opacity.
    veilTl?.kill();
    veilTl = gsap
      .timeline()
      .to(veil, { opacity: 1, duration: 0.22, ease: "power2.in" })
      .add(() => jumpTo(top))
      .to(veil, { opacity: 0, duration: 0.4, ease: "power2.out" });
  }

  // replaceState, not pushState: a Back press would otherwise jump natively,
  // bypassing Lenis and the scroll animations.
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", toTop ? pathname + search : hash);
  return true;
}
