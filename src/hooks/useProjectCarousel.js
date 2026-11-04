import { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/utils";

const DRAG_THRESHOLD = 6; // px of travel before a press counts as a drag, not a click
const FLICK_MS = 260; // how far (in ms of release velocity) a flick carries

// Infinite, draggable carousel for the Work section. No clones: every card is
// laid out once in a row and wrapped around with a modulo offset, so the list
// loops forever in both directions.
//
// Markup contract (see WorkSection): scope contains [data-viewport] > track >
// [data-card] items, each with a [data-art] layer for parallax.
//
// Input: drag/flick with the pointer (snaps to cards), arrow keys, focusing an
// off-screen card, and the returned prev/next. Returns the card nearest the
// left edge as `index` for the counter. Reduced motion: snaps instantly and the
// parallax is off.
export function useProjectCarousel(scope, count) {
  const [index, setIndex] = useState(0);
  const api = useRef({ prev: () => {}, next: () => {} });

  useGSAP(
    () => {
      const root = scope.current;
      const viewport = root.querySelector("[data-viewport]");
      const track = viewport.firstElementChild;
      const cards = gsap.utils.toArray("[data-card]", root);
      const arts = gsap.utils.toArray("[data-art]", root);
      const reduce = prefersReducedMotion();
      const ac = new AbortController();
      const { signal } = ac;

      const pos = { x: 0 }; // px offset of the whole row; cards sit at i * step
      let step = 0;
      let total = 0;
      let dest = 0; // where the row is heading (always a multiple of step at rest)
      let tween = null;
      let current = 0;
      let lastWidth = 0;

      const render = () => {
        const mid = viewport.clientWidth / 2 - step / 2;
        cards.forEach((card, i) => {
          const base = i * step;
          const p = gsap.utils.wrap(-step, total - step, base + pos.x);
          card.style.transform = `translate3d(${p - base}px,0,0)`;
          if (!reduce) {
            const shift = gsap.utils.clamp(-24, 24, (mid - p) * 0.03);
            arts[i].style.transform = `translate3d(${shift}px,0,0)`;
          }
        });
        const i = (((Math.round(-pos.x / step) % count) + count) % count) | 0;
        if (i !== current) {
          current = i;
          setIndex(i);
        }
      };

      const goTo = (x) => {
        dest = x;
        tween?.kill();
        tween = gsap.to(pos, {
          x,
          duration: reduce ? 0 : 0.9,
          ease: "power3.out",
          onUpdate: render,
        });
      };

      const measure = () => {
        const width = viewport.clientWidth;
        if (width === lastWidth) return; // height-only resizes (mobile toolbars) keep position
        lastWidth = width;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        step = cards[0].offsetWidth + gap;
        total = step * count;
        tween?.kill();
        pos.x = dest = -current * step;
        render();
      };
      const ro = new ResizeObserver(measure);
      ro.observe(viewport);

      // Drag: window-level move/up (no pointer capture, so card links still click).
      let dragging = false;
      let moved = 0;
      let startX = 0;
      let startPos = 0;
      let lastX = 0;
      let lastT = 0;
      let vel = 0;

      viewport.addEventListener(
        "pointerdown",
        (e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          tween?.kill();
          dragging = true;
          moved = 0;
          vel = 0;
          startX = lastX = e.clientX;
          startPos = pos.x;
          lastT = e.timeStamp;
        },
        { signal },
      );

      window.addEventListener(
        "pointermove",
        (e) => {
          if (!dragging) return;
          const dx = e.clientX - startX;
          moved = Math.max(moved, Math.abs(dx));
          if (moved > DRAG_THRESHOLD) viewport.dataset.dragging = "";
          const dt = Math.max(1, e.timeStamp - lastT);
          vel = 0.8 * vel + 0.2 * ((e.clientX - lastX) / dt);
          lastX = e.clientX;
          lastT = e.timeStamp;
          pos.x = startPos + dx;
          render();
        },
        { signal },
      );

      const release = (e) => {
        if (!dragging) return;
        dragging = false;
        delete viewport.dataset.dragging;
        if (e.timeStamp - lastT > 80) vel = 0; // paused before letting go: no flick
        const flick = gsap.utils.clamp(-2 * step, 2 * step, vel * FLICK_MS);
        goTo(Math.round((pos.x + flick) / step) * step);
      };
      window.addEventListener("pointerup", release, { signal });
      window.addEventListener("pointercancel", release, { signal });

      // A drag that ends over a card must not follow its link.
      viewport.addEventListener(
        "click",
        (e) => {
          if (moved > DRAG_THRESHOLD) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        { capture: true, signal },
      );
      viewport.addEventListener("dragstart", (e) => e.preventDefault(), { signal });

      viewport.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "ArrowLeft") api.current.prev();
          else if (e.key === "ArrowRight") api.current.next();
          else return;
          e.preventDefault();
        },
        { signal },
      );

      // Tabbing to a card that is off-screen brings it to the left edge, by
      // the shortest way round the loop.
      viewport.addEventListener(
        "focusin",
        (e) => {
          const i = cards.findIndex((c) => c.contains(e.target));
          if (i < 0) return;
          const p = gsap.utils.wrap(-step, total - step, i * step + pos.x);
          if (p >= 0 && p + cards[i].offsetWidth <= viewport.clientWidth) return;
          const target = -i * step;
          goTo(target + Math.round((pos.x - target) / total) * total);
        },
        { signal },
      );

      api.current = {
        prev: () => goTo(dest + step),
        next: () => goTo(dest - step),
      };

      // Entrance, once, as the section scrolls into view.
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-card-in]", {
          opacity: 0,
          x: 140,
          y: 40,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: viewport, start: "top 85%", once: true },
        });
      });

      return () => {
        ac.abort();
        ro.disconnect();
        tween?.kill();
        mm.revert();
      };
    },
    { scope },
  );

  return {
    index,
    prev: () => api.current.prev(),
    next: () => api.current.next(),
  };
}
