import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "../../../lib/gsap";
import { prefersReducedMotion } from "../../../lib/utils";

const fmt = new Intl.NumberFormat("en-US");

/**
 * The catalogue as a waffle, one square per listing. When it scrolls into view
 * the squares fill in order, one listing after another as the loop ran, and a
 * counter keeps pace. With reduced motion it renders filled. Beside it, the
 * figures that follow from the per-listing work (config: caseStudy.scale).
 */
export default function CatalogueScale({ scale }) {
  const ref = useRef(null);
  const countRef = useRef(null);
  const cells = Array.from({ length: scale.units });

  // CaseStudy fires case:play when this enters view (see [data-play]).
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const fills = ref.current.querySelectorAll("[data-fill]");
    gsap.set(fills, { scale: 0, autoAlpha: 0 });
    countRef.current.textContent = "0";
    return () => gsap.killTweensOf(fills);
  }, []);
  useEffect(() => {
    const el = ref.current;
    const play = () => {
      const fills = el.querySelectorAll("[data-fill]");
      const each = 1.6 / fills.length;
      gsap.to(fills, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)", stagger: each, delay: 0.2 });
      const o = { v: 0 };
      gsap.to(o, {
        v: fills.length,
        duration: 1.6,
        delay: 0.2,
        ease: "none",
        onUpdate: () => (countRef.current.textContent = fmt.format(Math.round(o.v))),
      });
    };
    el.addEventListener("case:play", play);
    return () => el.removeEventListener("case:play", play);
  }, []);

  return (
    <div ref={ref} data-play className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
      <figure data-rise>
        <div
          role="img"
          aria-label={`${fmt.format(scale.units)} squares, one per ${scale.unitLabel}, all filled: every ${scale.unitLabel} went through the pipeline.`}
          className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px] rounded-[1.5rem] bg-white/60 p-4 ring-1 ring-ink/10 sm:grid-cols-[repeat(35,minmax(0,1fr))] sm:p-5"
        >
          {cells.map((_, i) => (
            <span key={i} className="relative aspect-square rounded-[2px] bg-ink/[0.07]">
              <span data-fill className="absolute inset-0 rounded-[2px] bg-sky" />
            </span>
          ))}
        </div>
        <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm text-ink/55">
          <span>{scale.caption}</span>
          <span aria-hidden="true" className="font-mono text-xs tabular-nums">
            <span ref={countRef} className="text-ink">
              {fmt.format(scale.units)}
            </span>{" "}
            / {fmt.format(scale.units)} {scale.unitLabel}s
          </span>
        </figcaption>
      </figure>

      <dl className="self-center border-b border-ink/10">
        {scale.figures.map((f) => (
          <div key={f.label} data-rise className="flex flex-col-reverse gap-2 border-t border-ink/10 py-5">
            <dt className="text-sm leading-snug text-ink/60">
              {f.label}
              {f.how && <span className="mt-0.5 block font-mono text-[11px] text-ink/45">{f.how}</span>}
            </dt>
            <dd className="text-[clamp(2.75rem,2rem+2.4vw,4.25rem)] leading-[0.85] font-heading text-ink tabular-nums">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
