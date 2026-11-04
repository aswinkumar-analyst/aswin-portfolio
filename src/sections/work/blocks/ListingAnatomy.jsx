import { useEffect, useRef, useState } from "react";
import { pad2, prefersReducedMotion } from "../../../lib/utils";

// Skeleton copy per field kind: each line is [width after, width before] in %,
// and `keys` marks where the rewrite puts search terms, as [line, start, length].
// Before is ragged and unstructured; after is even, with terms up front.
const SHAPES = {
  title: { lines: [[88, 56]], keys: [[0, 0, 34]] },
  description: {
    lines: [[100, 72], [97, 100], [100, 61], [56, 90]],
    keys: [[0, 8, 20], [2, 44, 16]],
  },
  bullets: {
    bullet: true,
    lines: [[82, 40], [76, 96], [84, 52], [71, 88], [78, 30]],
    keys: [[0, 0, 26], [1, 0, 22], [2, 0, 28], [3, 0, 20], [4, 0, 24]],
  },
};

/**
 * The three listing fields every product shares, drawn as a listing editor
 * with skeleton lines, each paired with what the rewrite aims for. A
 * Before / After toggle re-flows the lines (CSS transitions on scale and
 * colour, see .anatomy in case.css). The first time it scrolls into view it
 * starts on Before and plays to After; with reduced motion it simply shows After.
 */
export default function ListingAnatomy({ anatomy }) {
  const ref = useRef(null);
  // Starts on Before, to play to After; reduced motion starts (and stays) on After.
  const [state, setState] = useState(() =>
    prefersReducedMotion() ? "after" : "before",
  );

  // CaseStudy fires case:play when this enters view (see [data-play]).
  useEffect(() => {
    const el = ref.current;
    let t;
    const play = () => (t = setTimeout(() => setState("after"), 450));
    el.addEventListener("case:play", play);
    return () => {
      el.removeEventListener("case:play", play);
      clearTimeout(t);
    };
  }, []);

  return (
    <div ref={ref} data-play>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p data-rise className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-ink/55">
          <span className="rounded bg-ink px-1.5 py-0.5 text-cloud">Playwright reads</span>→
          <span className="rounded bg-sky px-1.5 py-0.5 text-on-sky">Claude rewrites</span>→
          <span className="rounded bg-ink px-1.5 py-0.5 text-cloud">Playwright writes</span>
        </p>
        <div data-rise role="group" aria-label="Listing copy" className="flex rounded-full bg-ink/[0.06] p-1 text-[13px]">
          {["before", "after"].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={state === s}
              onClick={() => setState(s)}
              className={`rounded-full px-3.5 py-1.5 capitalize transition-[background-color,color,box-shadow] duration-200 ease-ui outline-sky ${
                state === s ? "bg-white text-ink shadow-[0_1px_2px_rgb(8_31_54/0.12)]" : "text-ink/55 hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div data-rise data-state={state} className="anatomy relative mt-6 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Two sheets peek out behind the editor: the same form, 700+ times. */}
        <span aria-hidden="true" className="absolute inset-x-6 -bottom-3 top-3 rounded-[1.5rem] bg-white/50 ring-1 ring-ink/[0.06] lg:right-auto lg:w-[calc(53.5%-3rem)]" />
        <span aria-hidden="true" className="absolute inset-x-3 -bottom-1.5 top-1.5 rounded-[1.5rem] bg-white/70 ring-1 ring-ink/[0.07] lg:right-auto lg:w-[calc(53.5%-1.5rem)]" />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[1.5rem] bg-white ring-1 ring-ink/10 shadow-[0_30px_60px_-40px_rgb(8_31_54/0.5)] lg:right-auto lg:w-[53.5%]"
        />

        {/* Editor chrome. */}
        <div className="relative flex items-center gap-3 border-b border-ink/[0.07] px-5 py-3.5 lg:col-start-1">
          <span aria-hidden="true" className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2.5 rounded-full bg-ink/10" />
            ))}
          </span>
          <span className="truncate font-mono text-[11px] text-ink/50">Seller Central · Edit listing</span>
          <span className="anatomy-status ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] whitespace-nowrap">
            <span className="anatomy-before">Original copy</span>
            <span className="anatomy-after">Optimised</span>
          </span>
        </div>

        <ol className="contents">
          {anatomy.fields.map((f, i) => {
            const shape = SHAPES[f.kind] ?? SHAPES.description;
            return (
              <li
                key={f.name}
                className={`relative grid grid-cols-[minmax(0,1fr)] gap-4 px-5 py-5 lg:col-span-2 lg:grid-cols-subgrid lg:gap-0 lg:p-0 ${
                  i > 0 ? "max-lg:border-t max-lg:border-ink/[0.07]" : ""
                }`}
              >
                {/* The field as it sits in the form. */}
                <div className={`lg:px-5 lg:py-5 ${i < anatomy.fields.length - 1 ? "lg:border-b lg:border-ink/[0.07]" : ""}`}>
                  <p className="text-xs font-medium text-ink/50">{f.name}</p>
                  <div aria-hidden="true" className="mt-2.5 space-y-2 overflow-hidden rounded-xl bg-paper/70 p-3.5 ring-1 ring-ink/[0.06]">
                    {shape.lines.map(([after, before], li) => (
                      <div key={li} className="flex items-center gap-2">
                        {shape.bullet && <span className="size-1 flex-none rounded-full bg-ink/30" />}
                        <span
                          className="anatomy-line relative h-2 rounded-full"
                          style={{ width: `${after}%`, "--b": before / after, "--i": li + i * 2 }}
                        >
                          {shape.keys
                            .filter(([k]) => k === li)
                            .map(([, start, len]) => (
                              <span
                                key={start}
                                className="anatomy-key absolute inset-y-0 rounded-full bg-sky"
                                style={{ left: `${start}%`, width: `${len}%` }}
                              />
                            ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What the rewrite aims for, joined to its field by a leader. */}
                <div className="relative lg:flex lg:items-center lg:py-5 lg:pr-2 lg:pl-14">
                  <span aria-hidden="true" className="absolute top-1/2 left-0 hidden h-px w-11 bg-sky/40 lg:block" />
                  <span aria-hidden="true" className="absolute top-1/2 left-0 hidden size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky lg:block" />
                  <div>
                    <p className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] text-sky tabular-nums">{pad2(i + 1)}</span>
                      <span className="text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-snug font-medium tracking-[-0.015em] text-ink">{f.goal}</span>
                    </p>
                    <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-pretty text-ink/65 lg:pl-8">{f.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {anatomy.note && <p className="mt-8 text-xs text-ink/50">{anatomy.note}</p>}
    </div>
  );
}
