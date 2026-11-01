import { ArrowDownIcon, ArrowUpRightIcon } from "../../components/ui/Icons";
import { FRAME_GUTTER } from "../../config/frame";

// Headline, supporting line and CTAs. Every element the reveal animates
// carries a data-hero attribute (see useHeroReveal); hidden states are set by
// GSAP, not CSS, so the copy stays visible if scripts or motion are off.
export default function HeroCopy({ copy }) {
  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 pt-[clamp(8rem,22svh,13.5rem)] ${FRAME_GUTTER}`}
    >
      <h1 className="text-[clamp(2.5rem,min(0.5rem+4.6vw,9svh),5.75rem)] leading-[0.98] font-semibold tracking-[-0.04em] text-balance text-on-sky">
        {copy.headline.map((line) => (
          <span key={line} data-hero="headline-line" className="block lg:whitespace-nowrap">
            {line}
          </span>
        ))}
      </h1>

      <p
        data-hero="subtext"
        className="mt-5 max-w-[30rem] text-[clamp(1.0625rem,0.95rem+0.4vw,1.3125rem)] leading-[1.45] tracking-[-0.01em] text-pretty text-on-sky-muted lg:mt-7"
      >
        {copy.subtext}
      </p>

      <div data-hero="ctas" className="mt-7 flex flex-wrap items-center gap-3 lg:mt-9">
        <a
          href={copy.primaryCta.href}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-cloud pr-4 pl-5 text-sm font-semibold tracking-[-0.01em] text-ink shadow-[0_4px_16px_rgb(2_30_50/0.18)] transition-[background-color,scale] duration-150 ease-ui hover:bg-white active:scale-[0.96] lg:h-11 lg:pr-5 lg:pl-6 lg:text-[0.9375rem]"
        >
          {copy.primaryCta.label}
          <ArrowDownIcon className="size-4 translate-y-px" strokeWidth={2} />
        </a>
        <a
          href={copy.secondaryCta.href}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-glass-border bg-glass px-4 text-sm font-semibold tracking-[-0.01em] text-on-sky backdrop-blur-md transition-[background-color,scale] duration-150 ease-ui hover:bg-white/25 active:scale-[0.96] lg:h-11 lg:px-5 lg:text-[0.9375rem]"
        >
          {copy.secondaryCta.label}
          <ArrowUpRightIcon className="size-4" strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
