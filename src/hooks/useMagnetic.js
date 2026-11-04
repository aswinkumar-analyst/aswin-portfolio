import { useEffect } from "react";

// Writes the pointer's offset from the element's centre (-0.5..0.5) to --mx and
// --my. Children marked data-magnet drift toward it (styles/buttons.css), so
// the button's hit area never moves. Mouse only; CSS also gates it on fine
// pointers and reduced motion.
export function useMagnetic(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    const leave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
}
