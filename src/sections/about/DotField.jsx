import { useEffect, useRef } from "react";

// Faint halftone dot grid behind the About copy. Dots swell and drift away
// from the pointer (mouse hover or touch drag), and a slow idle wave keeps the
// field breathing. Drawn on one canvas, only while on screen, and static under
// prefers-reduced-motion. Ink colour at low alpha, so it blends into the paper
// and stays behind the text.
const SPACING = 28;
const BASE_R = 1.4;
const BASE_ALPHA = 0.17;
const REACH = 190; // pointer influence radius, px
const PUSH = 16; // max displacement, px
const SWELL = 2.4; // extra radius at the pointer, px
const INK = "28 28 30";

export default function DotField({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    const ptr = { x: -9999, y: -9999, sx: -9999, sy: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) draw(0);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const bx = i * SPACING;
          const by = j * SPACING;
          // Slow diagonal wave: a gentle size and position ripple.
          const wave = Math.sin(bx * 0.012 + by * 0.009 + t * 0.0008);
          let x = bx + wave * 3;
          let y = by + wave * 3;
          let r = BASE_R + wave * 0.35;
          let a = BASE_ALPHA;

          const dx = bx - ptr.sx;
          const dy = by - ptr.sy;
          const d = Math.hypot(dx, dy);
          if (d < REACH) {
            const f = (1 - d / REACH) ** 2;
            x += (dx / (d || 1)) * PUSH * f;
            y += (dy / (d || 1)) * PUSH * f;
            r += SWELL * f;
            a += 0.3 * f;
          }

          ctx.fillStyle = `rgb(${INK} / ${a})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.2832);
          ctx.fill();
        }
      }
    };

    const loop = (t) => {
      // Ease the drawn pointer toward the real one so the field feels weighty.
      ptr.sx += (ptr.x - ptr.sx) * 0.12;
      ptr.sy += (ptr.y - ptr.sy) * 0.12;
      draw(t);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const move = (e) => {
      const rect = host.getBoundingClientRect();
      ptr.x = e.clientX - rect.left;
      ptr.y = e.clientY - rect.top;
      if (ptr.sx < -9000) {
        ptr.sx = ptr.x;
        ptr.sy = ptr.y;
      }
    };
    const leave = () => {
      ptr.x = ptr.y = -9999;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !still) raf = requestAnimationFrame(loop);
    });
    const ro = new ResizeObserver(resize);

    io.observe(host);
    ro.observe(host);
    resize();
    if (!still) {
      window.addEventListener("pointermove", move, { passive: true });
      host.addEventListener("pointerleave", leave);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  );
}
