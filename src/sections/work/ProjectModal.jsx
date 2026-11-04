import Lenis from "lenis";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "../../lib/gsap";
import { getLenis } from "../../lib/scroll";
import { prefersReducedMotion as reducedMotion } from "../../lib/utils";
import CaseStudy from "./CaseStudy";

// Phones held upright get the 4:5 cut of the film, everything else 16:9.
const PORTRAIT_MQ = "(max-width: 767px) and (orientation: portrait)";
const MORPH_IN = 0.75;
const MORPH_OUT = 0.6;
const MORPH_EASE = "power4.inOut"; // moving on screen: strong in-out, never a plain ease-in

const px = (n) => `${n.toFixed(2)}px`;

// The transform + clip that make a box laid out at `to` look exactly like the
// rect `from`: scaled until it covers `from`, centred on it, then clipped to
// it (clip-path works in the box's own, unscaled coordinates).
function coverState(from, to, radii) {
  const scale = Math.max(from.width / to.width, from.height / to.height);
  const ix = (to.width - from.width / scale) / 2;
  const iy = (to.height - from.height / scale) / 2;
  const r = radii.map((v) => px(v / scale)).join(" ");
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale,
    clipPath: `inset(${px(iy)} ${px(ix)} ${px(iy)} ${px(ix)} round ${r})`,
  };
}

function lockPage() {
  getLenis()?.stop();
  document.documentElement.style.overflow = "hidden";
}

function unlockPage() {
  document.documentElement.style.overflow = "";
  getLenis()?.start();
}

/**
 * The case-study dialog. A native <dialog> opened with showModal(), so focus
 * is trapped, the page behind is inert and Esc is handled by the browser.
 *
 * Open: the clicked card's cover is cloned into a fixed "ghost" that starts as
 * an exact copy of the card's frame and grows into the video stage while the
 * sheet settles in behind it; then the real stage takes over and the content
 * rises in. Close plays it backwards into whichever card shows that project
 * (or simply fades when no card is on screen, the stage is scrolled away, or
 * motion is reduced). The next-case link swaps content in place.
 *
 * `caseId` is the source of truth (see useCaseRoute); this component keeps the
 * last project on screen until its close animation has finished.
 */
export default function ProjectModal({ projects, caseId, onClose, onNavigate, getSource }) {
  const dialogRef = useRef(null);
  const backdropRef = useRef(null);
  const frameRef = useRef(null);
  const sheetRef = useRef(null);
  const scrollerRef = useRef(null);
  const ghostRef = useRef(null);
  const lenisRef = useRef(null);
  const tlRef = useRef(null);
  const phase = useRef("closed"); // closed | opening | open | swapping | closing
  const liftedRef = useRef(null); // the card cover hidden while its copy is in the dialog

  const [shownId, setShownId] = useState(null);
  const [portrait, setPortrait] = useState(false);
  const [ready, setReady] = useState(false); // open animation done: the film may play
  const [prevCase, setPrevCase] = useState(null);
  if (caseId !== prevCase) {
    setPrevCase(caseId);
    if (caseId && !shownId) {
      setShownId(caseId);
      setPortrait(window.matchMedia(PORTRAIT_MQ).matches);
    }
  }

  const shownIndex = projects.findIndex((p) => p.id === shownId);
  const shown = projects[shownIndex];
  const next = projects.length > 1 ? projects[(shownIndex + 1) % projects.length] : null;

  const parts = () => {
    const scroller = scrollerRef.current;
    return {
      scroller,
      items: scroller.querySelectorAll("[data-case-in]"),
      titleWords: scroller.querySelectorAll("[data-case-title] [data-word]"),
      screen: scroller.querySelector("[data-screen]"),
      stageBg: scroller.querySelector("[data-stage-bg]"),
    };
  };

  const restoreLifted = () => {
    if (liftedRef.current) liftedRef.current.style.visibility = "";
    liftedRef.current = null;
  };

  // A timeline that flies the ghost between a card's cover and the stage.
  const flight = (source, screen, direction) => {
    const ghost = ghostRef.current;
    const media = source.querySelector("[data-art] > div")?.firstElementChild;
    if (!media) return null;

    const to = screen.getBoundingClientRect();
    const from = source.getBoundingClientRect();
    const article = source.closest("article");
    const cardR = parseFloat(getComputedStyle(article).borderTopLeftRadius) || 0;
    const screenR = parseFloat(getComputedStyle(screen).borderTopLeftRadius) || 0;
    const card = coverState(from, to, [cardR, cardR, 0, 0]); // the cover only has top corners
    const stage = { x: 0, y: 0, scale: 1, clipPath: coverState(to, to, Array(4).fill(screenR)).clipPath };

    // The card's art can be zoomed in (hover) and an SVG cover is sized by the
    // wider parallax layer, so match its scale too or the hand-off would jump.
    const isSvg = media.tagName.toLowerCase() === "svg";
    const layer = source.querySelector("[data-art]").getBoundingClientRect();
    const zoom = (isSvg ? layer.width / (to.width * card.scale) : 1) * (article.matches(":hover") ? 1.1 : 1);

    const copy = media.cloneNode(true);
    copy.style.cssText = "display:block;width:100%;height:100%";
    ghost.replaceChildren(copy);
    Object.assign(ghost.style, {
      display: "block",
      left: px(to.left),
      top: px(to.top),
      width: px(to.width),
      height: px(to.height),
    });

    source.style.visibility = "hidden";
    liftedRef.current = source;
    screen.style.visibility = "hidden";

    const opening = direction === "in";
    const duration = opening ? MORPH_IN : MORPH_OUT;
    const [a, b] = opening ? [card, stage] : [stage, card];
    const tl = gsap.timeline();
    tl.fromTo(ghost, a, { ...b, duration, ease: MORPH_EASE }, 0);
    tl.fromTo(copy, { scale: opening ? zoom : 1 }, { scale: opening ? 1 : zoom, duration, ease: MORPH_EASE }, 0);
    tl.add(() => {
      ghost.style.display = "none";
      ghost.replaceChildren();
      if (opening) screen.style.visibility = "";
      else restoreLifted();
    });
    return tl;
  };

  const startInnerScroll = (scroller) => {
    if (reducedMotion()) return;
    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.firstElementChild,
      duration: 1.2,
      wheelMultiplier: 0.85,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    lenisRef.current = { lenis, tick };
  };

  const stopInnerScroll = () => {
    if (!lenisRef.current) return;
    gsap.ticker.remove(lenisRef.current.tick);
    lenisRef.current.lenis.destroy();
    lenisRef.current = null;
  };

  // Back to rest: dialog closed, page scrolling, card visible, content unmounted.
  const teardown = () => {
    tlRef.current?.kill();
    stopInnerScroll();
    unlockPage();
    restoreLifted();
    ghostRef.current.style.display = "none";
    gsap.set([backdropRef.current, frameRef.current, sheetRef.current], { clearProps: "all" });
    if (dialogRef.current.open) dialogRef.current.close();
    phase.current = "closed";
    setReady(false);
    setShownId(null);
  };

  const playOpen = useEffectEvent(() => {
    phase.current = "opening";
    const { scroller, items, titleWords, screen, stageBg } = parts();
    lockPage();
    dialogRef.current.showModal();
    scroller.scrollTop = 0;
    // Focus the sheet itself: it is never hidden by the entrance (a focused
    // element that turns invisible drops focus to <body>) and arrow keys scroll it.
    scroller.focus({ preventScroll: true });
    startInnerScroll(scroller);

    const tl = gsap.timeline({
      onComplete: () => {
        phase.current = "open";
        setReady(true);
      },
    });
    tlRef.current = tl;
    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0);

    if (reducedMotion()) {
      tl.fromTo(frameRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0);
      return;
    }

    const source = getSource(shownId);
    const morph = source && flight(source, screen, "in");
    tl.fromTo(sheetRef.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" }, morph ? 0.15 : 0);
    tl.fromTo(stageBg, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, morph ? 0.35 : 0.1);
    if (morph) tl.add(morph, 0);
    else tl.fromTo(screen, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.1);
    tl.fromTo(items, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 }, morph ? 0.45 : 0.15);
    tl.fromTo(titleWords, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.07 }, morph ? 0.5 : 0.2);
  });

  const playClose = useEffectEvent(() => {
    if (phase.current === "closed" || phase.current === "closing") return;
    tlRef.current?.kill();
    phase.current = "closing";
    setReady(false);

    const tl = gsap.timeline({ onComplete: teardown });
    tlRef.current = tl;

    if (reducedMotion()) {
      tl.to([frameRef.current, backdropRef.current], { opacity: 0, duration: 0.2, ease: "power2.out" });
      return;
    }

    const { items, screen, stageBg } = parts();
    const source = getSource(shownId);
    if (liftedRef.current !== source) restoreLifted();
    const s = screen.getBoundingClientRect();
    const f = frameRef.current.getBoundingClientRect();
    const stageInView = s.bottom > f.top + 96 && s.top < f.bottom - 96;
    const morph = source && stageInView && flight(source, screen, "out");

    tl.to(items, { autoAlpha: 0, y: -12, duration: 0.25, ease: "power2.out", stagger: 0.015 }, 0);
    if (!morph) tl.to(screen, { autoAlpha: 0, duration: 0.25, ease: "power2.out" }, 0);
    tl.to(stageBg, { opacity: 0, duration: 0.3, ease: "power2.out" }, morph ? 0.05 : 0);
    tl.to(sheetRef.current, { opacity: 0, scale: 0.97, duration: 0.4, ease: "power2.out" }, morph ? 0.1 : 0.05);
    if (morph) tl.add(morph, 0);
    tl.to(backdropRef.current, { opacity: 0, duration: 0.45, ease: "power2.out" }, morph ? 0.15 : 0.1);
  });

  const playSwap = useEffectEvent((id) => {
    if (phase.current === "opening") tlRef.current?.progress(1);
    if (phase.current !== "open") return;
    phase.current = "swapping";
    setReady(false);
    restoreLifted(); // closing will fly into the new project's card instead

    const done = () => {
      lenisRef.current?.lenis.scrollTo(0, { immediate: true, force: true });
      scrollerRef.current.scrollTop = 0;
      setShownId(id);
    };
    if (reducedMotion()) return done();
    const { items, screen } = parts();
    tlRef.current = gsap
      .timeline({ onComplete: done })
      .to([screen, ...items], { autoAlpha: 0, y: -16, duration: 0.3, ease: "power2.out", stagger: 0.02 });
  });

  // Open once the boot screen is gone (a shared ?case= link lands before it is).
  useEffect(() => {
    if (!shownId || phase.current !== "closed") return;
    let live = true;
    Promise.resolve(window.__boot?.ready).then(() => {
      if (live && phase.current === "closed") playOpen();
    });
    return () => {
      live = false;
    };
  }, [shownId]);

  useEffect(() => {
    if (!shownId) return;
    if (!caseId) playClose();
    else if (caseId !== shownId) playSwap(caseId);
  }, [caseId, shownId]);

  // After a swap the new content mounts hidden; bring it in.
  useLayoutEffect(() => {
    if (phase.current !== "swapping" || !shownId) return;
    const { scroller, items, titleWords, screen } = parts();
    const settle = () => {
      phase.current = "open";
      setReady(true);
      scroller.focus({ preventScroll: true });
    };
    if (reducedMotion()) return settle();
    tlRef.current = gsap
      .timeline({ onComplete: settle })
      .fromTo(screen, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0)
      .fromTo(items, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }, 0.08)
      .fromTo(titleWords, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.07 }, 0.12);
  }, [shownId]);

  // Unmounting mid-case (hot reload, route change) must not leave the page locked.
  useEffect(
    () => () => {
      if (phase.current !== "closed") {
        stopInnerScroll();
        unlockPage();
      }
    },
    [],
  );

  const scrollToEl = (el) => {
    if (!el) return;
    if (lenisRef.current) lenisRef.current.lenis.scrollTo(el, { offset: -88 });
    else el.scrollIntoView({ block: "start" });
  };

  return (
    <dialog
      ref={dialogRef}
      data-lenis-prevent
      aria-labelledby={shown ? `${shown.id}-title` : undefined}
      aria-describedby={shown ? `${shown.id}-summary` : undefined}
      // Esc: run the animated close instead of the browser's instant one.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // The browser can still force-close (a second Esc). Settle without animating.
      onClose={() => {
        if (phase.current === "closed" || phase.current === "closing") return;
        teardown();
        onClose();
      }}
      className="case-dialog"
    >
      <div ref={backdropRef} aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-ink-deep/55 backdrop-blur-[6px]" />
      <div ref={frameRef} className="case-frame relative">
        <div
          ref={sheetRef}
          aria-hidden="true"
          className="absolute inset-0 rounded-[1.75rem] bg-cloud shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_0_0_1px_rgb(8_31_54/0.08),0_40px_100px_-30px_rgb(8_31_54/0.6)]"
        />
        <div
          ref={scrollerRef}
          tabIndex={-1}
          className="case-scroller absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[1.75rem] outline-none"
        >
          <div>
            {shown && (
              <CaseStudy
                key={shown.id}
                project={shown}
                index={shownIndex}
                total={projects.length}
                next={next}
                portrait={portrait}
                ready={ready}
                scrollerRef={scrollerRef}
                scrollToEl={scrollToEl}
                onNext={onNavigate}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
      <div ref={ghostRef} aria-hidden="true" className="pointer-events-none fixed z-10 hidden overflow-hidden" />
    </dialog>
  );
}
