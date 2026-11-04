import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, CloseIcon } from "../../components/ui/Icons";
import { gsap } from "../../lib/gsap";
import FlightArrow from "../../components/ui/FlightArrow";
import CaseVideo from "./CaseVideo";
import CoverMedia from "./CoverMedia";
import CatalogueScale from "./blocks/CatalogueScale";
import ListingAnatomy from "./blocks/ListingAnatomy";
import SystemMap from "./blocks/SystemMap";
import { pad2, prefersReducedMotion } from "../../lib/utils";

const PAD = "px-5 sm:px-8 lg:px-12";
const MODEL_KIND = /llm|ai\b|claude/i; // architecture steps where a model decides
const WIDE_MQ = "(min-width: 1024px)"; // the pipeline turns horizontal here

// Display text split into words, each inside its own line mask so it can rise
// out of it (see .case-word). Spaces sit between the masks, so wrapping and
// text-balance behave exactly as with the plain string.
function Words({ text }) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="case-word">
        <span data-word>{w}</span>
      </span>
    </Fragment>
  ));
}

// "~84 min" -> ["~", 84, " min", 0 decimals, grouped?]. Null when there is no number.
function parseMetric(value) {
  const m = value.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const digits = m[2];
  return {
    prefix: m[1],
    to: parseFloat(digits.replace(/,/g, "")),
    suffix: m[3],
    decimals: digits.split(".")[1]?.length ?? 0,
    grouped: digits.includes(","),
  };
}

/**
 * The case study inside ProjectModal: sticky bar with chapter tabs, video stage,
 * header, metrics, then chapters. Each chapter puts its display title in a sticky
 * left column beside the content; `wide` chapters (diagrams, images) take the
 * full width under their title instead. Everything is data-driven from
 * config/projects.js; absent blocks drop out of the page and the tabs.
 *
 * Motion contract with ProjectModal: [data-case-in] items are revealed by the
 * modal's open / swap timeline, [data-screen] is the frame the card's cover
 * morphs into, and the title's [data-word]s rise in with it. Everything below
 * the fold is choreographed by the scroll observer (see its comment).
 */
export default function CaseStudy({ project, index, total, next, portrait, ready, scrollerRef, scrollToEl, onNext, onClose }) {
  const { id, title, client, tags, video, caseStudy: cs } = project;
  const rootRef = useRef(null);
  const progressRef = useRef(null);
  const tabsRef = useRef(null);
  const [active, setActive] = useState(null);
  const [titleGone, setTitleGone] = useState(false);
  const [pill, setPill] = useState(null); // { x, w } of the active tab

  const sections = [
    cs.overview && { key: "overview", label: "Overview" },
    (cs.problem || cs.solution) && { key: "problem", label: "Problem & solution", tab: "Problem" },
    cs.anatomy && { key: "anatomy", label: "Listing anatomy", tab: "Anatomy", wide: true },
    (cs.systemMap || cs.architecture) && { key: "architecture", label: "Architecture", wide: true },
    cs.features && { key: "features", label: "Core features", tab: "Features" },
    cs.stack && { key: "stack", label: "Tech stack", tab: "Stack" },
    cs.challenges && { key: "challenges", label: "Challenges" },
    cs.gallery && { key: "gallery", label: "Gallery", wide: true },
    cs.scale && { key: "scale", label: "At scale", tab: "Scale", wide: true },
    cs.outcomes && { key: "outcomes", label: cs.outcomes.title },
  ].filter(Boolean);
  const sid = (key) => `${id}-${key}`;
  const current = active ?? sections[0]?.key;

  // Reading progress, the active chapter and the condensed title in the bar.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const root = rootRef.current;
    const bar = progressRef.current; // captured: a scroll event can land after unmount, before cleanup
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? scroller.scrollTop / max : 0})`;
    };
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });

    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.dataset.section);
      },
      { root: scroller, rootMargin: "-30% 0px -60% 0px" },
    );
    root.querySelectorAll("[data-section]").forEach((el) => spy.observe(el));

    const heading = new IntersectionObserver(([e]) => setTitleGone(!e.isIntersecting), {
      root: scroller,
      rootMargin: "-64px 0px 0px 0px",
    });
    heading.observe(root.querySelector("[data-case-title]"));

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      spy.disconnect();
      heading.disconnect();
    };
  }, [scrollerRef]);

  // The pill slides under the active tab; an overflowing tab strip scrolls to keep it in view.
  useLayoutEffect(() => {
    const strip = tabsRef.current;
    const measure = () => {
      const tab = strip.querySelector(`[data-tab="${current}"]`)?.parentElement; // the <li>: offsets are relative to the strip
      if (!tab) return;
      setPill({ x: tab.offsetLeft, w: tab.offsetWidth });
      const { scrollLeft, clientWidth } = strip;
      if (tab.offsetLeft < scrollLeft + 16) strip.scrollTo({ left: tab.offsetLeft - 16, behavior: "smooth" });
      else if (tab.offsetLeft + tab.offsetWidth > scrollLeft + clientWidth - 16)
        strip.scrollTo({ left: tab.offsetLeft + tab.offsetWidth - clientWidth + 16, behavior: "smooth" });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    return () => ro.disconnect();
  }, [current]);

  // Scroll choreography. Each piece is observed on its own, and whatever enters
  // in the same frame is staggered in document order (a batch), so a long list
  // reveals row by row as it is read instead of all at once off-screen.
  //   [data-rule]    chapter hairline draws left to right
  //   [data-split]   display words rise out of their line masks
  //   [data-rise]    content block fades up
  //   [data-diagram] its [data-node] markers pop and [data-draw] connectors draw on
  //   [data-media]   image unclips from an inset while its zoom settles
  //   [data-play]    a block with its own reveal (work/blocks) gets a case:play event
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    const q = (sel, el = root) => [...el.querySelectorAll(sel)];
    const wide = window.matchMedia(WIDE_MQ).matches;
    const axis = (el) => (el.dataset.draw === "auto" ? (wide ? "x" : "y") : el.dataset.draw);
    const clip = {
      x: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
      "x-rev": ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"], // draws right to left
      y: ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"],
    };
    const MEDIA_FROM = "inset(7% 5% 7% 5% round 1.5rem)";
    const MEDIA_TO = "inset(0% 0% 0% 0% round 1.5rem)";

    const rises = q("[data-rise]");
    const splits = q("[data-split]");
    const rules = q("[data-rule]");
    const diagrams = q("[data-diagram]");
    const media = q("[data-media]");
    const plays = q("[data-play]");
    const words = q("[data-split] [data-word]");
    const draws = q("[data-draw]");
    const nodes = q("[data-node]");
    const imgs = q("[data-media] img");

    gsap.set(rises, { autoAlpha: 0, y: 24 });
    gsap.set(words, { yPercent: 115 });
    gsap.set(rules, { scaleX: 0 });
    draws.forEach((el) => gsap.set(el, { clipPath: clip[axis(el)][0] }));
    gsap.set(nodes, { scale: 0.5, autoAlpha: 0 });
    gsap.set(media, { clipPath: MEDIA_FROM });
    gsap.set(imgs, { scale: 1.12 });

    const play = (el, slot) => {
      const delay = Math.min(slot, 6) * 0.07;
      if (el.hasAttribute("data-rule")) gsap.to(el, { scaleX: 1, duration: 1.3, ease: "expo.inOut" });
      if (el.hasAttribute("data-rise")) gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", delay });
      if (el.hasAttribute("data-split")) {
        const w = q("[data-word]", el);
        // Short display lines get a readable cadence; long quotes ripple quickly.
        gsap.to(w, { yPercent: 0, duration: 1, ease: "expo.out", delay: delay + 0.05, stagger: w.length > 10 ? 0.014 : 0.07 });
      }
      if (el.hasAttribute("data-diagram")) {
        gsap.to(q("[data-node]", el), { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2)", stagger: 0.09, delay: 0.15 });
        q("[data-draw]", el).forEach((d, i) =>
          gsap.to(d, { clipPath: clip[axis(d)][1], duration: 0.6, ease: "power3.inOut", delay: 0.25 + i * 0.09 }),
        );
      }
      if (el.hasAttribute("data-media")) {
        gsap.to(el, { clipPath: MEDIA_TO, duration: 1.3, ease: "expo.out" });
        gsap.to(q("img", el), { scale: 1, duration: 1.6, ease: "expo.out" });
      }
      if (el.hasAttribute("data-play")) el.dispatchEvent(new CustomEvent("case:play"));
    };

    const io = new IntersectionObserver(
      (entries) => {
        const batch = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        batch.forEach((el, i) => {
          io.unobserve(el);
          play(el, i);
        });
      },
      { root: scrollerRef.current, rootMargin: "0px 0px -10% 0px" },
    );
    const observed = new Set([...rules, ...splits, ...rises, ...diagrams, ...media, ...plays]);
    observed.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      gsap.killTweensOf([...observed, ...words, ...draws, ...nodes, ...imgs]);
    };
  }, [scrollerRef]);

  // Metrics count up once the dialog has opened. The final value is in the
  // aria-label, so assistive tech never hears the intermediate numbers.
  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const tweens = [...rootRef.current.querySelectorAll("[data-count]")].map((el, i) => {
      const m = parseMetric(el.dataset.count);
      if (!m) return null;
      const fmt = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: m.decimals,
        maximumFractionDigits: m.decimals,
        useGrouping: m.grouped,
      });
      const o = { v: 0 };
      return gsap.to(o, {
        v: m.to,
        duration: 1.4,
        delay: i * 0.08,
        ease: "expo.out",
        onUpdate: () => (el.textContent = m.prefix + fmt.format(o.v) + m.suffix),
      });
    });
    return () => tweens.forEach((t) => t?.progress(1).kill());
  }, [ready]);

  const nav = (key) => (e) => {
    e.preventDefault();
    scrollToEl(document.getElementById(sid(key)));
  };

  // Each chapter returns { lead?, aside?, body }.
  const render = {
    overview: () => {
      const [first, ...rest] = cs.overview;
      return {
        body: (
          <div className="max-w-[62ch]">
            <p data-rise className="text-[clamp(1.25rem,1.1rem+0.6vw,1.5rem)] leading-[1.4] tracking-[-0.015em] text-pretty text-ink">
              {first}
            </p>
            {rest.map((p, i) => (
              <p key={i} data-rise className="mt-5 text-[1.0625rem] leading-relaxed text-pretty text-ink/70">
                {p}
              </p>
            ))}
          </div>
        ),
      };
    },

    problem: () => {
      const { problem, solution } = cs;
      const routes = solution?.points ?? [];
      return {
        body: (
          <>
            {problem && (
              <div>
                <h4 data-rise className="text-sm font-medium text-ink/50">The problem</h4>
                <p data-rise className="mt-2 max-w-[40ch] text-[clamp(1.375rem,1.15rem+0.8vw,1.75rem)] leading-[1.3] tracking-[-0.02em] text-pretty text-ink">
                  {problem.lead}
                </p>
                <ul className="mt-8 grid gap-x-10 md:grid-cols-2">
                  {problem.points.map((pt) => (
                    <li key={pt.title} data-rise className="border-t border-ink/10 py-5">
                      <p className="font-medium text-ink">{pt.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink/65">{pt.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {solution && (
              <div data-rise className={`${problem ? "mt-10" : ""} rounded-[1.75rem] bg-sky/[0.055] p-6 ring-1 ring-sky/15 sm:p-8`}>
                <h4 className="text-sm font-medium text-sky-deep">The solution</h4>
                <p className="mt-2 max-w-[44ch] text-[clamp(1.25rem,1.1rem+0.6vw,1.5rem)] leading-[1.35] tracking-[-0.015em] text-pretty text-ink">
                  {solution.lead}
                </p>

                {/* A routing tree: one stem from the lead, a branch per part of the solution. */}
                <ul
                  data-diagram
                  className="mt-8 grid gap-5 md:mt-12 md:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
                  style={{ "--n": routes.length }}
                >
                  {routes.map((pt, i) => (
                    <li key={pt.title} className="relative max-md:border-t max-md:border-sky/15 max-md:pt-5">
                      {i === 0 && (
                        <span data-draw="y" aria-hidden="true" className="absolute -top-12 left-3 hidden h-6 w-px bg-sky/40 md:block" />
                      )}
                      {i < routes.length - 1 && (
                        <span data-draw="x" aria-hidden="true" className="absolute -top-6 left-3 -right-8 hidden h-px bg-sky/40 md:block" />
                      )}
                      <span aria-hidden="true" className="absolute -top-6 left-3 hidden h-4 w-px bg-sky/40 md:block" />
                      <span
                        data-node
                        aria-hidden="true"
                        className="absolute -top-[27.5px] left-[8.5px] hidden size-[7px] rounded-full bg-sky md:block"
                      />
                      {pt.label && (
                        <span className="inline-block rounded-md bg-white px-2 py-1 font-mono text-[11px] leading-none text-sky-deep ring-1 ring-sky/20">
                          {pt.label}
                        </span>
                      )}
                      <p className="mt-3 font-medium text-ink">{pt.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink/65">{pt.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {solution?.callout && (
              <figure data-rise className="case-sky relative mt-6 overflow-hidden rounded-[1.75rem] px-6 py-8 text-on-sky sm:px-10 sm:py-12">
                <blockquote
                  data-split
                  className="relative max-w-[38ch] text-[clamp(1.375rem,1.1rem+1vw,2rem)] leading-[1.25] font-medium tracking-[-0.02em] text-pretty"
                >
                  <Words text={solution.callout} />
                </blockquote>
                <figcaption className="relative mt-7 flex items-center gap-2.5 text-sm text-on-sky-muted">
                  <span aria-hidden="true" className="case-sun" />
                  The key design idea
                </figcaption>
              </figure>
            )}
          </>
        ),
      };
    },

    anatomy: () => ({ lead: cs.anatomy.lead, body: <ListingAnatomy anatomy={cs.anatomy} /> }),

    scale: () => ({ lead: cs.scale.lead, body: <CatalogueScale scale={cs.scale} /> }),

    architecture: () => {
      if (cs.systemMap) return { lead: cs.systemMap.lead, body: <SystemMap map={cs.systemMap} /> };
      const { lead, lanes } = cs.architecture;
      const kinds = lanes.flatMap((l) => l.steps.map((s) => MODEL_KIND.test(s.kind)));
      const mixed = kinds.includes(true) && kinds.includes(false);
      return {
        lead,
        aside: mixed && (
          <p data-rise className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/60">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-sky" /> Model step
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full border border-ink/40 bg-cloud" /> Deterministic step
            </span>
          </p>
        ),
        body: (
          <div className="space-y-12">
            {lanes.map((lane, li) => (
              <div key={li}>
                {lane.label && (
                  <p data-rise className="mb-6 flex items-center gap-3 text-sm font-medium text-ink">
                    {lane.label}
                    <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
                  </p>
                )}
                <ol data-diagram className="grid lg:auto-cols-fr lg:grid-flow-col lg:gap-x-4">
                  {lane.steps.map((step, i) => {
                    const model = MODEL_KIND.test(step.kind);
                    const last = i === lane.steps.length - 1;
                    return (
                      <li key={step.title} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0 lg:block lg:pb-0">
                        {!last && (
                          <span
                            data-draw="auto"
                            aria-hidden="true"
                            className={`absolute top-9 bottom-0 left-[1.125rem] w-px lg:top-[1.125rem] lg:right-[-1rem] lg:bottom-auto lg:left-9 lg:h-px lg:w-auto ${
                              model ? "bg-sky/45" : "bg-ink/15"
                            }`}
                          />
                        )}
                        <span
                          data-node
                          className={`relative grid size-9 place-items-center rounded-full font-mono text-[11px] tabular-nums ${
                            model
                              ? "bg-sky text-on-sky shadow-[0_6px_14px_-6px_rgb(15_104_166/0.7)]"
                              : "border border-ink/20 bg-cloud text-ink/70"
                          }`}
                        >
                          {pad2(i + 1)}
                        </span>
                        <div data-rise className="pt-1 lg:mt-4 lg:pt-0 lg:pr-3">
                          <span
                            className={`inline-block rounded-md px-1.5 py-0.5 font-mono text-[10px] tracking-wide uppercase ${
                              model ? "bg-sky/10 text-sky-deep" : "bg-ink/5 text-ink/55"
                            }`}
                          >
                            {step.kind}
                          </span>
                          <h4 className="mt-2 text-[1.0625rem] leading-snug font-medium text-ink">{step.title}</h4>
                          <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink/65">{step.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        ),
      };
    },

    features: () => ({
      body: (
        <ul className="grid gap-x-10 md:grid-cols-2">
          {cs.features.map((f) => (
            <li key={f.title} data-rise className="border-t border-ink/10 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <h4 className="text-[1.0625rem] leading-snug font-medium text-ink">{f.title}</h4>
                <span className="flex-none text-xs font-medium text-sky-deep">{f.tag}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink/65">{f.body}</p>
            </li>
          ))}
        </ul>
      ),
    }),

    stack: () => ({
      body: (
        <dl className="border-b border-ink/10">
          {cs.stack.map((row) => (
            <div
              key={row.layer}
              data-rise
              className="grid gap-1 border-t border-ink/10 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-6 xl:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <dt className="pt-0.5 text-sm text-ink/50">{row.layer}</dt>
              <dd className="font-medium text-ink">{row.technology}</dd>
              <dd className="text-sm leading-relaxed text-pretty text-ink/60 sm:col-start-2 xl:col-start-auto xl:pt-0.5">{row.reason}</dd>
            </div>
          ))}
        </dl>
      ),
    }),

    challenges: () => ({
      body: (
        <ol className="border-b border-ink/10">
          {cs.challenges.map((c) => (
            <li key={c.title} data-rise className="border-t border-ink/10 py-7">
              <h4 className="text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-snug font-medium tracking-[-0.015em] text-balance text-ink">
                {c.title}
              </h4>
              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
                <div className="md:py-4">
                  <p className="text-xs font-medium text-ink/45">Problem</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink/65">{c.problem}</p>
                </div>
                <span aria-hidden="true" className="hidden size-8 place-items-center self-center rounded-full border border-ink/10 text-ink/40 md:grid">
                  <ArrowRightIcon className="size-4" />
                </span>
                <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-sky/15 shadow-[0_8px_20px_-14px_rgb(8_31_54/0.35)]">
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-deep">
                    <CheckIcon className="size-3.5" strokeWidth={2.25} /> Fix
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink/85">{c.fix}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ),
    }),

    gallery: () => ({
      body: (
        <div className={`grid gap-8 ${cs.gallery.length > 1 ? "md:grid-cols-2" : ""}`}>
          {cs.gallery.map((img) => (
            <figure key={img.fallback}>
              <div data-media className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-ink/10 shadow-[0_30px_60px_-36px_rgb(8_31_54/0.5)]">
                <picture>
                  <source type="image/avif" srcSet={img.avif} />
                  <img
                    src={img.fallback}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full"
                  />
                </picture>
              </div>
              <figcaption data-rise className="mt-4 max-w-[60ch] text-sm text-ink/60">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      ),
    }),

    outcomes: () => ({
      body: (
        <ul className="grid gap-x-10 md:grid-cols-2">
          {cs.outcomes.items.map((o) => (
            <li key={o.title} data-rise className="border-t border-ink/10 pt-5 pb-8">
              <p className="text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] leading-[1.2] font-medium tracking-[-0.02em] text-balance text-ink">
                {o.title}
              </p>
              <p className="mt-2.5 max-w-[46ch] leading-relaxed text-pretty text-ink/60">{o.body}</p>
            </li>
          ))}
        </ul>
      ),
    }),
  };

  return (
    <div ref={rootRef} className="pb-6 sm:pb-8">
      {/* Sticky bar: case index, chapter tabs (title on phones once it scrolls away), Esc, close, progress. */}
      <div data-case-in className="sticky top-0 z-20 border-b border-ink/[0.07] bg-cloud/85 backdrop-blur-xl">
        <div className={`flex h-16 items-center gap-3 ${PAD}`}>
          <p className="flex min-w-0 flex-1 items-center gap-3 text-sm md:flex-none">
            <span className="font-mono text-xs text-sky tabular-nums">
              {pad2(index + 1)} / {pad2(total)}
            </span>
            <span
              aria-hidden={!titleGone}
              className={`truncate font-medium text-ink transition-[opacity,translate] duration-300 ease-ui md:hidden ${
                titleGone ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
              }`}
            >
              {title}
            </span>
          </p>

          <nav aria-label="Case study chapters" className="hidden min-w-0 flex-1 justify-center md:flex">
            <ol ref={tabsRef} className="case-tabs relative flex min-w-0 overflow-x-auto px-4">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_1px_2px_rgb(8_31_54/0.08),0_4px_12px_-6px_rgb(8_31_54/0.2)] ring-1 ring-ink/[0.08] transition-[translate,width,opacity] duration-500 ease-ui"
                style={{ width: pill?.w ?? 0, translate: `${pill?.x ?? 0}px 0`, opacity: pill ? 1 : 0 }}
              />
              {sections.map((s) => {
                const on = current === s.key;
                return (
                  <li key={s.key} className="relative flex-none">
                    <a
                      href={`#${sid(s.key)}`}
                      data-tab={s.key}
                      onClick={nav(s.key)}
                      aria-current={on ? "location" : undefined}
                      className={`block rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-200 ease-ui outline-sky ${
                        on ? "text-ink" : "text-ink/50 hover:text-ink"
                      }`}
                    >
                      {s.tab ?? s.label}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <kbd className="hidden rounded-md border border-ink/15 bg-white/70 px-1.5 py-0.5 font-mono text-[11px] text-ink/50 [@media(hover:hover)]:inline">
            Esc
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className="grid size-11 flex-none place-items-center rounded-full border border-ink/10 bg-white/80 text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] transition-[background-color,color,rotate,scale] duration-200 ease-ui outline-sky hover:rotate-90 hover:bg-ink hover:text-cloud active:scale-95"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <span ref={progressRef} aria-hidden="true" className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-sky" />
      </div>

      {/* Video stage: the one dark surface, so the film reads like a screen in a room. */}
      <div className="relative mx-3 mt-3 sm:mx-5 sm:mt-5">
        <div data-stage-bg aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[1.25rem] bg-ink-deep">
          <span className="absolute -top-1/3 left-1/2 h-[80%] w-[70%] -translate-x-1/2 rounded-full bg-sky/35 blur-[90px]" />
          <span className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1.2px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        </div>
        <div className="relative flex justify-center p-0 sm:p-6 lg:p-8">
          <div
            data-screen
            className={`case-screen relative w-full overflow-hidden rounded-[1.25rem] sm:rounded-xl ${
              !video ? "case-screen--wide aspect-[4/3] sm:aspect-[21/9]" : portrait ? "case-screen--portrait aspect-[4/5]" : "aspect-video"
            }`}
          >
            {video ? (
              <CaseVideo project={project} portrait={portrait} active={ready} />
            ) : (
              <CoverMedia project={project} sizes="(min-width: 768px) 80rem, 100vw" loading="eager" />
            )}
          </div>
        </div>
      </div>

      <header className={`pt-10 sm:pt-14 ${PAD}`}>
        <h2
          id={`${id}-title`}
          data-case-title
          data-case-in
          className="text-[clamp(3.25rem,1.6rem+5.6vw,7.5rem)] leading-[0.86] font-heading font-normal text-balance text-ink"
        >
          <Words text={title} />
        </h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] lg:gap-16">
          <div data-case-in>
            <p
              id={`${id}-summary`}
              className="max-w-[36ch] text-[clamp(1.25rem,1.05rem+0.8vw,1.75rem)] leading-[1.3] tracking-[-0.015em] text-pretty text-ink"
            >
              {cs.summary}
            </p>
            <ul className="mt-7 flex flex-wrap items-center gap-1.5">
              <li className="mr-2 text-sm font-medium text-sky-deep">{client}</li>
              {tags.map((tag) => (
                <li key={tag} className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-xs text-ink/75">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          {cs.meta && (
            <dl data-case-in className="divide-y divide-ink/10 border-y border-ink/10 text-sm">
              {cs.meta.map((m) => (
                <div key={m.label} className="grid grid-cols-[4.5rem_1fr] gap-3 py-3">
                  <dt className="text-ink/45">{m.label}</dt>
                  <dd className="leading-relaxed text-pretty text-ink/80">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {cs.metrics && (
        <div data-case-in className={`mt-12 sm:mt-16 ${PAD}`}>
          <dl className="grid grid-cols-2 gap-px border-y border-ink/10 bg-ink/10 lg:grid-cols-4">
            {cs.metrics.map((m) => (
              <div
                key={m.label}
                className="flex flex-col-reverse justify-end gap-3 bg-cloud py-6 pr-4 pl-5 odd:pl-0 sm:py-8 lg:pl-6 lg:odd:pl-6 lg:first:pl-0"
              >
                <dt className="text-sm leading-snug text-ink/55">{m.label}</dt>
                <dd className="text-[clamp(3rem,2.2rem+2.8vw,5rem)] leading-[0.85] font-heading text-ink tabular-nums">
                  <span aria-hidden="true" data-count={m.value}>
                    {m.value}
                  </span>
                  <span className="sr-only">{m.value}</span>
                </dd>
              </div>
            ))}
          </dl>
          {cs.metricsNote && <p className="mt-4 max-w-3xl text-xs leading-relaxed text-ink/55">{cs.metricsNote}</p>}
        </div>
      )}

      <div className={`mt-20 space-y-20 sm:mt-28 sm:space-y-28 ${PAD}`}>
        {sections.map((s) => {
          const { lead, aside, body } = render[s.key]();
          const headingId = `${sid(s.key)}-h`;
          const leadEl = lead && (
            <p data-rise className="max-w-[48ch] text-lg leading-relaxed text-pretty text-ink/75 sm:text-xl">
              {lead}
            </p>
          );
          return (
            <section
              key={s.key}
              id={sid(s.key)}
              data-section={s.key}
              aria-labelledby={headingId}
              className="relative grid scroll-mt-20 gap-y-8 pt-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-12"
            >
              <span data-rule aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-ink/10" />
              <div className={s.wide ? "" : "lg:sticky lg:top-24 lg:self-start"}>
                <h3
                  id={headingId}
                  data-split
                  className="text-[clamp(2.5rem,2rem+1.8vw,3.75rem)] leading-[0.9] font-heading font-normal text-balance text-ink"
                >
                  <Words text={s.label} />
                </h3>
              </div>
              {s.wide ? (
                <>
                  <div className="flex flex-col gap-5 lg:pt-2">
                    {leadEl}
                    {aside}
                  </div>
                  <div className="min-w-0 lg:col-span-2 lg:mt-4">{body}</div>
                </>
              ) : (
                <div className="min-w-0 lg:pt-2">
                  {leadEl && <div className="mb-8">{leadEl}</div>}
                  {body}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <footer className={`mt-20 sm:mt-28 ${PAD}`}>
        {(cs.note || cs.links?.length > 0) && (
          <div data-rise className="mb-6 flex flex-col gap-5 rounded-[1.5rem] bg-ink/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            {cs.note && <p className="max-w-2xl text-sm leading-relaxed text-pretty text-ink/70">{cs.note}</p>}
            {cs.links?.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {cs.links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cloud transition-[background-color,scale] duration-150 ease-ui outline-sky hover:bg-sky active:scale-[0.97]"
                    >
                      {l.label}
                      <ArrowUpRightIcon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {next && (
          <button
            type="button"
            data-rise
            onClick={() => onNext(next.id)}
            className="group/next fly-host relative flex w-full items-stretch overflow-hidden rounded-[1.5rem] bg-ink-deep text-left text-on-sky outline-sky"
          >
            <span className="relative z-10 flex min-w-0 flex-1 flex-col justify-between gap-8 p-6 sm:p-8">
              <span className="text-sm text-on-sky-muted">Next case study</span>
              <span>
                <span className="block text-sm text-on-sky-muted">{next.client}</span>
                <span className="mt-1 flex items-end gap-4 text-[clamp(2.25rem,1.6rem+2.6vw,4rem)] leading-[0.9] font-heading">
                  {next.title}
                  <FlightArrow icon={ArrowRightIcon} dir="right" className="mb-2 size-7" />
                </span>
              </span>
            </span>
            <span aria-hidden="true" className="relative hidden w-[40%] max-w-sm flex-none overflow-hidden sm:block">
              <span className="absolute inset-0 block transition-[scale] duration-700 ease-ui group-hover/next:scale-105">
                <CoverMedia project={next} sizes="24rem" decorative />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-ink-deep to-transparent to-60%" />
            </span>
          </button>
        )}

        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-ink/55">
          <span>{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="wipe inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 py-2.5 font-medium text-ink transition-[color,border-color,scale] duration-300 ease-ui outline-sky hover:border-ink hover:text-cloud active:scale-[0.96]"
          >
            Back to work
            <CloseIcon className="size-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
