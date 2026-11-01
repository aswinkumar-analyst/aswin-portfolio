import { useRef } from "react";
import { aboutCopy, skillRows } from "../../config/about";
import { FRAME_GUTTER } from "../../config/frame";
import { useAboutScroll } from "../../hooks/useAboutScroll";
import SkillsMarquee from "./SkillsMarquee";

/**
 * About: slides up over the pinned hero (see useAboutScroll). The rounded cream
 * card and dot field behind it live in App, shared with the Work section.
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
      className="relative"
    >
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
