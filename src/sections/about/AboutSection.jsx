import { useRef } from "react";
import { aboutCopy, skillRows } from "../../config/about";
import { FRAME_GUTTER } from "../../config/frame";
import { useAboutScroll } from "../../hooks/useAboutScroll";
import DotField from "./DotField";
import SkillsMarquee from "./SkillsMarquee";

/**
 * About: slides up over the pinned hero as a rounded cream card (see
 * useAboutScroll). Stack, back to front: dot field -> copy -> marquee.
 */
export default function AboutSection({ copy = aboutCopy, rows = skillRows }) {
  const root = useRef(null);
  useAboutScroll(root);

  const words = copy.statement.split(" ");

  return (
    <section
      ref={root}
      id="about"
      aria-labelledby="about-title"
      className="relative z-10 isolate overflow-clip rounded-t-[1.75rem] bg-cloud shadow-[0_-24px_60px_rgb(8_31_54/0.14)] sm:rounded-t-frame"
    >
      {/* Sticky viewport-sized layer: the dots stay put while the card scrolls
          past, instead of travelling up with the content. */}
      <div className="pointer-events-none sticky top-0 mb-[-100svh] h-svh">
        <DotField />
      </div>

      <div data-pin className={`relative ${FRAME_GUTTER} pt-24 pb-16 sm:pt-32 lg:pt-44 lg:pb-24`}>
        <h2
          id="about-title"
          className="text-sm font-semibold tracking-[0.14em] text-sky uppercase"
        >
          {copy.eyebrow}
        </h2>

        <p
          data-statement
          aria-label={copy.statement}
          className="mt-6 max-w-[22ch] text-[clamp(1.75rem,0.9rem+3.6vw,4.25rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-balance text-ink sm:mt-8 sm:max-w-[26ch] lg:max-w-[30ch]"
        >
          {words.map((word, i) => (
            <span key={i} aria-hidden="true">
              {/* Word is the unbreakable unit (no mid-word wraps); the
                  characters inside fade one by one. */}
              <span className="inline-block whitespace-nowrap">
                {[...word].map((ch, c) => (
                  <span key={c} data-char>
                    {ch}
                  </span>
                ))}
              </span>{" "}
            </span>
          ))}
        </p>
      </div>

      <div className="relative pb-20 sm:pb-28 lg:pb-36">
        <SkillsMarquee rows={rows} />
      </div>
    </section>
  );
}
