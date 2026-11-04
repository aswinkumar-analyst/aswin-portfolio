import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../../lib/gsap";

// Copies of each row's items in the track. The loop wraps after one copy, so
// the remaining copies must cover the viewport: four fill a 4K-wide screen.
const COPIES = 4;
// Resting drift in px/s, per row (row two runs the other way).
const SPEEDS = [34, 28];

function Chip({ item, ...rest }) {
  const logo = item.icon || item.src;
  return (
    <li
      {...rest}
      className={`marquee__chip glass ${logo ? "" : "marquee__chip--plain"}`}
      style={item.icon ? { "--brand": `#${item.icon.hex}` } : undefined}
    >
      {item.icon && (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="marquee__logo">
          <path d={item.icon.path} />
        </svg>
      )}
      {!item.icon && item.src && (
        <img src={item.src} alt="" width={20} height={20} loading="lazy" decoding="async" className="marquee__logo" />
      )}
      {item.label}
    </li>
  );
}

function Row({ items }) {
  return (
    <div className="marquee" data-marquee>
      <ul className="marquee__track" data-marquee-track>
        {Array.from({ length: COPIES }, (_, copy) =>
          items.map((item) => (
            // Only the first copy is read out; the rest are visual repeats.
            <Chip key={`${copy}-${item.label}`} item={item} aria-hidden={copy > 0 || undefined} />
          )),
        )}
      </ul>
    </div>
  );
}

/**
 * Two infinite rows drifting in opposite directions, driven by one GSAP ticker
 * (transform only). Scrolling speeds them up and they follow the scroll
 * direction; hovering a row eases it almost to a stop; offscreen they idle.
 * Under reduced motion the rows sit still and wrap (styles/about.css).
 */
export default function SkillsMarquee({ rows }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rowEls = gsap.utils.toArray("[data-marquee]");
        const lanes = rowEls.map((row, i) => {
          const track = row.querySelector("[data-marquee-track]");
          return {
            row,
            track,
            set: gsap.quickSetter(track, "x", "px"),
            dir: i % 2 ? 1 : -1,
            speed: SPEEDS[i % SPEEDS.length],
            span: 0,
            x: 0,
            hover: 1,
          };
        });

        const measure = () => {
          for (const lane of lanes) {
            lane.span = lane.track.scrollWidth / COPIES;
            // Row two starts mid-copy so the rows don't line up at load.
            if (!lane.x && lane.dir > 0) lane.x = -lane.span * 0.5;
          }
        };
        measure();
        const ro = new ResizeObserver(measure);
        lanes.forEach((lane) => ro.observe(lane.track));

        // Scroll feeds a boost that decays back to the resting drift, and a
        // direction (+1 down, -1 up) the rows ease towards.
        const motion = { boost: 0, sign: 1, target: 1 };
        // Visibility via IO, not trigger bounds: the About pin above shifts
        // those bounds after this trigger is created.
        let active = false;
        const io = new IntersectionObserver(([entry]) => (active = entry.isIntersecting));
        io.observe(root.current);
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            motion.boost = Math.max(motion.boost, Math.min(Math.abs(self.getVelocity()) / 220, 9));
            motion.target = self.direction;
          },
        });

        const tick = () => {
          if (!active) return;
          const dt = Math.min(gsap.ticker.deltaRatio(60), 3) / 60;
          const k = 1 - Math.exp(-dt * 5);
          motion.boost += (0 - motion.boost) * (1 - Math.exp(-dt * 2.5));
          motion.sign += (motion.target - motion.sign) * k;
          for (const lane of lanes) {
            if (!lane.span) continue;
            const v = lane.dir * lane.speed * (1 + motion.boost) * motion.sign * lane.hover;
            lane.x = gsap.utils.wrap(-lane.span, 0, lane.x + v * dt);
            lane.set(lane.x);
          }
        };
        gsap.ticker.add(tick);

        // Hover eases a row down to a crawl rather than freezing it.
        const listeners = lanes.map((lane) => {
          const slow = () => gsap.to(lane, { hover: 0.12, duration: 0.8, ease: "power3.out", overwrite: true });
          const resume = () => gsap.to(lane, { hover: 1, duration: 1.2, ease: "power2.inOut", overwrite: true });
          lane.row.addEventListener("pointerenter", slow);
          lane.row.addEventListener("pointerleave", resume);
          return () => {
            lane.row.removeEventListener("pointerenter", slow);
            lane.row.removeEventListener("pointerleave", resume);
          };
        });

        return () => {
          gsap.ticker.remove(tick);
          io.disconnect();
          ro.disconnect();
          listeners.forEach((off) => off());
          lanes.forEach((lane) => gsap.set(lane.track, { clearProps: "transform" }));
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} id="stack" className="flex flex-col gap-3 sm:gap-4">
      {rows.map((items, i) => (
        <Row key={i} items={items} />
      ))}
    </div>
  );
}
