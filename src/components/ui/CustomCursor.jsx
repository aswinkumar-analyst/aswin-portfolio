import { useEffect, useRef, useState } from "react";
import { gsap } from "../../lib/gsap";
import "../../styles/cursor.css";

// Fine pointers only, and never under reduced motion: everyone else keeps the native cursor.
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const INTERACTIVE = "a[href], button, [role='button'], label, summary, select, [tabindex]:not([tabindex='-1'])";
const TEXT = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea, [contenteditable='true']";

/**
 * Dot + trailing ring (styles/cursor.css). State lives in data attributes on
 * the root so every visual change is a CSS transform/opacity transition:
 *   data-state  "link" over interactive elements, "label" over [data-cursor="Text"],
 *               "text" over inputs (hidden, native caret shows)
 *   data-tone   "light" over [data-cursor-tone="light"] (dark surfaces)
 * Hover is resolved on pointerover (element change), not on every move.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const root = useRef(null);
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = root.current;
    const ringEl = ring.current;
    const dotEl = dot.current;
    const labelEl = label.current;
    const html = document.documentElement;
    const ringX = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3.out" });
    let shown = false;

    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const { clientX: x, clientY: y } = e;
      dotEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!shown) {
        // First move: snap the ring so it doesn't fly in from the corner.
        gsap.set(ringEl, { x, y });
        ringX(x, x);
        ringY(y, y);
        shown = true;
        html.classList.add("has-cursor");
        el.dataset.visible = "";
      } else {
        ringX(x);
        ringY(y);
      }
    };

    const over = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      el.dataset.tone = t.closest("[data-cursor-tone]")?.dataset.cursorTone ?? "";
      const labelled = t.closest("[data-cursor]");
      if (t.closest(TEXT)) el.dataset.state = "text";
      else if (labelled) {
        labelEl.textContent = labelled.dataset.cursor;
        el.dataset.state = "label";
      } else if (t.closest(INTERACTIVE)) el.dataset.state = "link";
      else el.dataset.state = "";
    };

    const hide = () => {
      delete el.dataset.visible;
      shown = false;
    };
    const out = (e) => {
      if (!e.relatedTarget) hide(); // left the window (or entered an iframe)
    };
    const down = () => (el.dataset.pressed = "");
    const up = () => delete el.dataset.pressed;

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", hide);
      gsap.killTweensOf(ringEl);
      html.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring">
        <span className="cursor__disc" />
        <span ref={label} className="cursor__label" />
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}
