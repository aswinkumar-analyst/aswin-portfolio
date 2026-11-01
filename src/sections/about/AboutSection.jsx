import { useRef } from "react";
import { aboutCopy, skillRows } from "../../config/about";
import { FRAME_GUTTER } from "../../config/frame";
import { useAboutScroll } from "../../hooks/useAboutScroll";
import Eyebrow from "../../components/ui/Eyebrow";
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
        <Eyebrow as="h2" id="about-title">
          {copy.eyebrow}
        </Eyebrow>

        <p
          data-statement
          className="mt-6 max-w-[44ch] text-[clamp(1.75rem,0.9rem+3.6vw,4.25rem)] leading-[1.08] font-heading font-normal text-balance text-ink sm:mt-8"
        >
          {/* A <p> can't take aria-label, so screen readers get this copy instead
              of the per-character spans. */}
          <span className="sr-only">{copy.statement}</span>
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
        <div className={`mb-6 sm:mb-8 ${FRAME_GUTTER}`}>
          <Eyebrow>Tech stack</Eyebrow>
        </div>
        <SkillsMarquee rows={rows} />
      </div>
    </section>
  );
}
