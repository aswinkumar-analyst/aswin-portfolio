import { useEffect, useRef, useState } from "react";
import sky from "../../assets/hero/sky-1280.webp";

// Gaps between the dots: the sky's shadow, so clouds read as lit dots.
const GROUND = "#024b75";
// Same crop as the hero sky (object-[62%_100%]): the cloud tops.
const FOCUS_X = 0.62;
const FOCUS_Y = 1;
// 2x2 ordered-dither offsets, within one 6-bit quantisation step (4).
const BAYER = [0, 2, 3, 1];

// The hero sky redrawn as a hexagonal halftone. Each cell samples one pixel of
// the image (scaled down to the grid, object-cover) and becomes a dot of that
// colour, its radius growing with brightness. Drawn once per size, never per
// frame: motion comes from transforms on the parent (useOutroMotion).
function draw(canvas, img) {
  // offset*, not getBoundingClientRect: the parent is scaled by GSAP.
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  if (!w || !h) return false;

  const cell = w < 640 ? 4 : 5;
  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;

  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sctx = sample.getContext("2d", { willReadFrequently: true });
  const scale = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  sctx.drawImage(img, (cols - dw) * FOCUS_X, (rows - dh) * FOCUS_Y, dw, dh);
  const px = sctx.getImageData(0, 0, cols, rows).data;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, w, h);

  // Luminance range of this crop, so dot size uses the full scale and the
  // cloud forms read clearly instead of sitting in a narrow mid band.
  const lums = new Float32Array(cols * rows);
  let lo = 1;
  let hi = 0;
  for (let k = 0; k < lums.length; k++) {
    const i = k * 4;
    const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
    lums[k] = l;
    if (l < lo) lo = l;
    if (l > hi) hi = l;
  }
  const span = Math.max(hi - lo, 1e-3);

  // One path per quantised colour: a few thousand fills instead of ~25k.
  // 6 bits per channel plus a 2x2 ordered dither keeps the smooth sky
  // gradient from stepping into visible bands.
  const buckets = new Map();
  const max = cell * 0.6;
  const q = (v, d) => Math.min(255, v + d) & 0xfc;
  for (let y = 0; y < rows; y++) {
    const shift = (y % 2) * cell * 0.5; // hex offset on odd rows
    for (let x = 0; x < cols; x++) {
      const k = y * cols + x;
      const i = k * 4;
      const d = BAYER[(y & 1) * 2 + (x & 1)];
      const r = q(px[i], d);
      const g = q(px[i + 1], d);
      const b = q(px[i + 2], d);
      const t = (lums[k] - lo) / span;
      const radius = max * (0.26 + 0.74 * t * t * (3 - 2 * t));
      const key = (r << 16) | (g << 8) | b;
      let list = buckets.get(key);
      if (!list) buckets.set(key, (list = []));
      list.push(x * cell + shift, y * cell + cell * 0.5, radius);
    }
  }
  for (const [key, list] of buckets) {
    ctx.fillStyle = `rgb(${key >> 16} ${(key >> 8) & 255} ${key & 255})`;
    ctx.beginPath();
    for (let j = 0; j < list.length; j += 3) {
      ctx.moveTo(list[j] + list[j + 2], list[j + 1]);
      ctx.arc(list[j], list[j + 1], list[j + 2], 0, Math.PI * 2);
    }
    ctx.fill();
  }
  return true;
}

export default function HalftoneSky({ className = "" }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    let img = null;
    let frame = 0;
    let lastW = 0;
    let lastH = 0;
    let disposed = false;

    const render = () => {
      frame = 0;
      if (!img || disposed) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      if (draw(canvas, img)) setReady(true);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    // Fetch and decode the sky only when the footer is getting close.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const image = new Image();
        image.decoding = "async";
        image.src = sky;
        image
          .decode()
          .then(() => {
            img = image;
            schedule();
          })
          .catch(() => {}); // the GROUND fill behind the canvas stays as fallback
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(schedule);
    ro.observe(canvas);

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`block size-full transition-opacity duration-700 ease-ui motion-reduce:transition-none ${
        ready ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}
