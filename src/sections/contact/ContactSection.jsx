import { useRef } from "react";
import { contactCopy as copy } from "../../config/contact";
import { useContactMotion } from "../../hooks/useContactMotion";
import Eyebrow from "../../components/ui/Eyebrow";
import ContactDetails from "./ContactDetails";
import ContactForm from "./ContactForm";

/**
 * Contact: closing section of the cream card. Intro on the left, form on the
 * right (stacked on mobile), direct contact details underneath.
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
      className="relative px-5 pt-4 pb-16 sm:px-8 sm:pb-20 lg:px-[7.5%] lg:pb-24"
    >
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="lg:w-[min(26rem,34%)] lg:flex-none">
          <Eyebrow data-reveal>{copy.eyebrow}</Eyebrow>
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
          <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            {copy.summary}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <ContactForm flyPlane={flyPlane} />
        </div>
      </div>

      <div className="mt-16 sm:mt-20">
        <ContactDetails />
      </div>
    </section>
  );
}
