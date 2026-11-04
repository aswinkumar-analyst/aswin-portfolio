import { useRef } from "react";
import { EyeIcon } from "../../components/ui/Icons";
import ResumeButton from "../../components/ui/ResumeButton";
import { FRAME_GUTTER } from "../../config/frame";
import { useMagnetic } from "../../hooks/useMagnetic";

// Headline, supporting line and CTAs. Every element the reveal animates
// carries a data-hero attribute (see useHeroReveal); hidden states are set by
// GSAP, not CSS, so the copy stays visible if scripts or motion are off.
export default function HeroCopy({ copy }) {
  const primary = useRef(null);
  useMagnetic(primary);

  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 pt-[clamp(8rem,22svh,13.5rem)] ${FRAME_GUTTER}`}
    >
      <h1 className="text-[clamp(2.5rem,min(0.5rem+4.6vw,9svh),5.75rem)] leading-[0.98] font-heading font-normal text-balance text-on-sky">
        <span className="sr-only">{copy.headline.map((line) => line.trim()).join(" ")}</span>
        {copy.headline.map((line) => (
          <span key={line} aria-hidden="true" className="block lg:whitespace-nowrap">
            {line
              .trim()
              .split(" ")
              .map((word, w) => (
                <span key={w}>
                  {/* Each word is the mask its letters rise out of. */}
                  <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                    {[...word].map((ch, c) => (
                      <span key={c} data-hero="char" className="inline-block">
                        {ch}
                      </span>
                    ))}
                  </span>{" "}
                </span>
              ))}
          </span>
        ))}
      </h1>

      <p
        data-hero="subtext"
        className="mt-5 max-w-[30rem] text-[clamp(1.0625rem,0.95rem+0.4vw,1.3125rem)] leading-[1.45] tracking-[-0.01em] text-pretty text-on-sky-muted lg:mt-7"
      >
        {copy.subtext}
      </p>

      {/* Two glass pills printed like the sky: a halftone fringe along the
          bottom, and on hover a dot flood blooming from the pointer while
          the fringe re-inks in the contrast colour (styles/buttons.css). */}
      <div data-hero="ctas" className="mt-7 flex flex-wrap items-center gap-3 lg:mt-9">
        <a ref={primary} href={copy.primaryCta.href} className="halftone halftone--frost h-12 lg:h-13">
          <span className="halftone__glint" aria-hidden="true" />
          <span data-magnet className="halftone__icon" aria-hidden="true">
            <EyeIcon className="eye" strokeWidth={2} />
          </span>
          <span data-magnet className="halftone__label">
            {copy.primaryCta.label}
          </span>
        </a>
        <ResumeButton className="h-12 lg:h-13" />
      </div>
    </div>
  );
}
