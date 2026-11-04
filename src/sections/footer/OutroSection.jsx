import { useRef } from "react";
import ResumeButton from "../../components/ui/ResumeButton";
import { outroCopy } from "../../config/site";
import { useOutroMotion } from "../../hooks/useOutroMotion";
import HalftoneSky from "./HalftoneSky";

// Eased (smootherstep-like) fade instead of a linear ramp: a linear alpha
// ramp shows a visible crease where it starts and ends (Mach bands).
const SKY_FADE =
  "linear-gradient(to bottom, transparent 0%, rgb(0 0 0 / 0.02) 10%, rgb(0 0 0 / 0.07) 18%, rgb(0 0 0 / 0.16) 26%, rgb(0 0 0 / 0.29) 34%, rgb(0 0 0 / 0.45) 42%, rgb(0 0 0 / 0.62) 50%, rgb(0 0 0 / 0.78) 58%, rgb(0 0 0 / 0.9) 66%, rgb(0 0 0 / 0.97) 74%, #000 82%)";

/**
 * Closing CTA at the foot of the cream card: a centred sign-off and the
 * résumé capsule, over the hero sky redrawn as halftone. The sky band fades
 * up out of the cream and is clipped by the card's rounded bottom corners, so
 * the page ends on the same sky it opened with.
 */
export default function OutroSection({ copy = outroCopy }) {
  const root = useRef(null);
  useOutroMotion(root);
  const words = copy.headline.split(" ");

  return (
    <section ref={root} aria-labelledby="outro-title" className="relative">
      <div className="relative z-10 flex flex-col items-center px-5 pt-10 text-center sm:px-8 lg:pt-16">
        <h2
          id="outro-title"
          aria-label={copy.headline}
          className="text-[clamp(3rem,1.5rem+6vw,7.5rem)] leading-[0.95] font-heading font-normal text-balance text-ink"
        >
          {words.map((word, i) => (
            <span key={i} aria-hidden="true">
              <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                <span data-outro-word className="inline-block">
                  {word}
                </span>
              </span>{" "}
            </span>
          ))}
        </h2>
        <div data-outro-cta className="mt-7 lg:mt-9">
          <ResumeButton variant="ink" className="h-13 lg:h-14" />
        </div>
      </div>

      {/* The band tucks under the CTA; its mask fades the sky in from the
          cream. The mask stays put while the inner layer rises through it.
          The layer is 150% tall so its top edge stays above the band through
          the whole rise (yPercent 30) and never shows as a hard line. */}
      <div
        data-outro-band
        className="relative -mt-[clamp(3rem,8vw,7rem)] h-[clamp(17rem,38vw,32rem)] overflow-hidden"
        style={{ maskImage: SKY_FADE, WebkitMaskImage: SKY_FADE }}
      >
        <div data-outro-sky className="absolute inset-x-0 bottom-0 h-[150%] origin-bottom will-change-transform">
          <HalftoneSky />
        </div>
      </div>
    </section>
  );
}
