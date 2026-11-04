import { useRef } from "react";
import { contactCopy as copy } from "../../config/contact";
import { useContactMotion } from "../../hooks/useContactMotion";
import Eyebrow from "../../components/ui/Eyebrow";
import ContactDetails from "./ContactDetails";
import ContactForm from "./ContactForm";
import SocialLinks from "./SocialLinks";

/**
 * Contact: closing section of the cream card. Two columns from lg up: the
 * pitch and direct routes on the left, the glass form panel on the right.
 * Stacked below lg, in the same reading order.
 */
export default function ContactSection() {
  const root = useRef(null);
  // Called here, not in ContactForm: a child's layout effects run before this
  // section's ref is attached, which would leave GSAP without a scope.
  const flyPlane = useContactMotion(root);
  const words = copy.headline.split(" ");

  return (
    <section
      ref={root}
      id="contact"
      aria-labelledby="contact-title"
      className="relative px-5 pt-4 pb-16 sm:px-8 sm:pb-20 lg:px-[7.5%] lg:pb-28"
    >
      {/* The form column stays narrow: a contact form reads as short when it
          is, and line inputs much wider look like rules, not fields. */}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] xl:gap-24">
        <div className="flex flex-col lg:pt-2">
          <Eyebrow data-reveal className="self-start">
            {copy.eyebrow}
          </Eyebrow>
          <h2
            id="contact-title"
            aria-label={copy.headline}
            className="mt-6 text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] leading-[1.05] font-heading font-normal text-balance text-ink"
          >
            {words.map((word, i) => (
              <span key={i} aria-hidden="true">
                <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span data-word className="inline-block">
                    {word}
                  </span>
                </span>{" "}
              </span>
            ))}
          </h2>
          <p data-reveal className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-ink/70">
            {copy.summary}
          </p>

          <ContactDetails />
          <SocialLinks />
        </div>

        <div className="min-w-0">
          <ContactForm flyPlane={flyPlane} />
        </div>
      </div>
    </section>
  );
}
