import { Fragment } from "react";
import { pad2 } from "../../../lib/utils";

// Lane tones. Sky marks the model, as in the generic architecture chapter;
// everything deterministic is ink, and the platform takes the project's accent.
const TONE = {
  control: { text: "text-ink/55", dot: "border border-ink/40 bg-cloud", chip: "bg-ink/5 text-ink/60" },
  automation: { text: "text-ink", dot: "bg-ink", chip: "bg-ink text-cloud" },
  model: { text: "text-sky", dot: "bg-sky", chip: "bg-sky text-on-sky" },
  platform: { text: "text-[#8a6235]", dot: "bg-[#8a6235]", chip: "bg-[#8a6235] text-white" },
};

/**
 * A sequence diagram of one pass through the pipeline: a lifeline per actor,
 * an arrow per call, replies dashed, all inside a loop frame. On wide screens
 * the lanes sit right of the step copy with each call labelled on its arrow;
 * on phones they shrink to a strip left of the copy, which lists the calls.
 * The lanes are drawn for sighted readers only; the copy carries every call.
 *
 * Motion: rides CaseStudy's [data-diagram] reveal, so end dots pop and arrows
 * draw in document order, which is the order the calls happen.
 */
export default function SystemMap({ map }) {
  const { lanes, groups, steps, loop } = map;
  const at = Object.fromEntries(lanes.map((l, i) => [l.id, i]));
  const tone = Object.fromEntries(lanes.map((l) => [l.id, TONE[l.tone] ?? TONE.control]));

  return (
    <div className="rounded-[1.75rem] bg-white/60 p-4 ring-1 ring-ink/10 sm:p-6 lg:p-8">
      {/* Lane headers, grouped into the layers they belong to. The padding and
          clear border match the loop frame below, so headers sit on their lifelines. */}
      <div
        aria-hidden="true"
        className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 border-x border-transparent px-3 sm:px-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-x-8"
      >
        <div className="hidden lg:block" />
        <div className="col-start-1 lg:col-start-2">
          <div className="hidden grid-cols-4 gap-x-2 pb-3 lg:grid">
            {groups.map((g) => (
              <p
                key={g.label}
                className="border-b border-ink/15 pb-2 text-center font-mono text-[10px] tracking-[0.14em] text-ink/45 uppercase"
                style={{ gridColumn: `span ${g.span}` }}
              >
                {g.label}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-4">
            {lanes.map((l) => (
              <div key={l.id} className="flex flex-col items-center text-center">
                <span className={`rounded-md px-1.5 py-1 font-mono text-[10px] leading-none ${tone[l.id].chip} lg:px-2.5 lg:py-1.5 lg:text-[11px]`}>
                  <span className="lg:hidden">{l.short}</span>
                  <span className="hidden lg:inline">{l.name}</span>
                </span>
                <span className="mt-1.5 hidden text-xs text-ink/50 lg:block">{l.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The loop frame, labelled like a sequence-diagram fragment. */}
      <div className="relative mt-4 rounded-2xl border border-dashed border-ink/20 pt-9 pb-3 lg:mt-6">
        <p className="absolute top-0 left-0 rounded-tl-2xl rounded-br-xl border-r border-b border-dashed border-ink/20 bg-cloud px-3 py-1.5 font-mono text-[11px] text-ink/60">
          {loop}
        </p>

        <ol data-diagram className="px-3 sm:px-4">
          {steps.map((step, si) => (
            <li
              key={step.title}
              className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-x-8"
            >
              {/* Step copy. On phones it also lists the calls; on wide screens
                  they move onto the arrows and stay here for screen readers. */}
              <div data-rise className="order-2 py-4 lg:order-1 lg:py-5">
                <p className="font-mono text-[11px] text-sky tabular-nums">STEP {pad2(si + 1)}</p>
                <h4 className="mt-1 text-[1.0625rem] leading-snug font-medium text-ink">{step.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink/65">{step.body}</p>
                <ul className="mt-2.5 space-y-1 lg:sr-only">
                  {step.calls.map((c, ci) => (
                    <li key={ci} className="font-mono text-[11px] leading-relaxed text-ink/55">
                      <span className={tone[c.from].text}>{lanes[at[c.from]].short}</span>
                      {c.from === c.to ? " ⟲ " : c.reply ? " ⇢ " : " → "}
                      {c.from !== c.to && <span className={tone[c.to].text}>{lanes[at[c.to]].short}</span>} {c.tag && `${c.tag} · `}
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lanes: a lifeline per actor, the step's calls stacked between them. */}
              <div aria-hidden="true" className="seq-lanes order-1 flex flex-col justify-center gap-7 py-4 lg:order-2 lg:gap-9 lg:py-5">
                {step.calls.map((c, ci) => (
                  <Call key={ci} call={c} from={at[c.from]} to={at[c.to]} tone={tone[c.from]} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/55">
        {[
          ["border-t-[1.5px] border-solid border-ink/60", "Call"],
          ["border-t-[1.5px] border-dashed border-ink/60", "Reply"],
        ].map(([line, label]) => (
          <span key={label} className="inline-flex items-center gap-2">
            <span className={`w-6 ${line}`} /> {label}
          </span>
        ))}
        {lanes.map((l) => (
          <span key={l.id} className="inline-flex items-center gap-2 lg:hidden">
            <span className={`size-2.5 rounded-full ${tone[l.id].dot}`} /> {l.short} · {l.name}
          </span>
        ))}
      </p>
    </div>
  );
}

// One arrow between two lifelines (25% apart), or a self-call loop on one.
function Call({ call, from, to, tone }) {
  const self = from === to;
  const left = (Math.min(from, to) + 0.5) * 25;
  const width = Math.abs(to - from) * 25;
  const rtl = to < from;
  const line = call.reply ? "border-dashed" : "border-solid";

  return (
    <div className={`relative h-5 ${tone.text}`}>
      {self ? (
        <>
          <span
            data-draw="x"
            className={`absolute top-0 h-5 w-[9%] rounded-r-lg border-[1.5px] border-l-0 border-current ${line}`}
            style={{ left: `${left}%` }}
          />
          <Dot left={left} tone={tone} />
          <Label call={call} className="top-1/2 -translate-y-1/2" x={left + 11} />
        </>
      ) : (
        <>
          {/* A box tall enough to hold the arrowhead, since the draw-on clips to it. */}
          <span
            data-draw={rtl ? "x-rev" : "x"}
            className="absolute top-1/2 h-4 -translate-y-1/2"
            style={{ left: `${left}%`, width: `${width}%` }}
          >
            <span className={`absolute inset-x-0 top-1/2 border-t-[1.5px] border-current ${line}`} />
            {/* Arrowhead at the receiving end. */}
            <span
              className={`absolute top-1/2 mt-[-4px] size-2 border-t-[1.5px] border-r-[1.5px] border-current ${
                rtl ? "left-0.5 rotate-[-135deg]" : "right-0.5 rotate-45"
              }`}
            />
          </span>
          <Dot left={(from + 0.5) * 25} tone={tone} />
          <Label call={call} className="bottom-1/2 mb-1.5 -translate-x-1/2" x={left + width / 2} />
        </>
      )}
    </div>
  );
}

function Dot({ left, tone }) {
  return (
    <span
      data-node
      className={`absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white/80 ${tone.dot}`}
      style={{ left: `${left}%` }}
    />
  );
}

function Label({ call, className, x }) {
  return (
    <span
      className={`absolute hidden whitespace-nowrap font-mono text-[11px] leading-none lg:block ${className}`}
      style={{ left: `${x}%` }}
    >
      {call.tag && (
        <Fragment>
          <span className="rounded bg-current/10 px-1 py-0.5 text-[10px] tracking-wide uppercase">{call.tag}</span>{" "}
        </Fragment>
      )}
      <span className="text-ink/70">{call.label}</span>
    </span>
  );
}
