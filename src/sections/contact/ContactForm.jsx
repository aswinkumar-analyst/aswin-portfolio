import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowUpRightIcon, PaperPlaneIcon } from "../../components/ui/Icons";
import FlightArrow from "../../components/ui/FlightArrow";
import { contactCopy as copy, contactDetails, formConfig } from "../../config/contact";
import { gsap } from "../../lib/gsap";
import { submitContact } from "../../lib/submitContact";
import GlassBg from "../../components/ui/GlassBg";
import RollLabel from "../../components/ui/RollLabel";
import { useMagnetic } from "../../hooks/useMagnetic";
import PaperPlane from "./PaperPlane";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass = "field";

function validate({ name, email, message }) {
  const errors = {};
  if (!name) errors.name = "Enter your name.";
  if (!email) errors.email = "Enter your email so I can reply.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email, like you@company.com.";
  if (!message) errors.message = "Add a short message.";
  return errors;
}

// The label sits inside the control and floats up on focus or once filled
// (.float in styles/glass.css). It stays a real <label>, so it is always read.
function Field({ name, label, error, children }) {
  return (
    <div data-field className="flex flex-col">
      <div className="float">
        <label htmlFor={`contact-${name}`} className="float__label">
          {label}
        </label>
        {children}
      </div>
      {error && (
        <p id={`contact-${name}-error`} className="mt-2 ps-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function fieldProps(name, errors, clearError) {
  return {
    id: `contact-${name}`,
    name,
    maxLength: formConfig.maxLength[name],
    required: true,
    // A single space keeps :placeholder-shown true until the visitor types.
    placeholder: " ",
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    onChange: () => clearError(name),
  };
}

/** The form itself. status: idle > sending > flying > sent. */
export default function ContactForm({ flyPlane }) {
  const form = useRef(null);
  const successHeading = useRef(null);
  const sendButton = useRef(null);
  useMagnetic(sendButton);

  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [sender, setSender] = useState(null);

  const clearError = (name) => setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

  const fail = (message) => {
    const { email } = contactDetails;
    toast.error(message, {
      action: email ? { label: "Email me", onClick: () => (window.location.href = `mailto:${email}`) } : undefined,
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status !== "idle") return;

    const data = new FormData(form.current);
    if (data.get("botcheck")) return; // honeypot: only bots tick the hidden box

    const values = {
      name: data.get("name").trim(),
      email: data.get("email").trim(),
      message: data.get("message").trim(),
    };

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.current.elements[firstInvalid].focus();
      return;
    }

    setStatus("sending");
    try {
      await submitContact(values);
    } catch (error) {
      setStatus("idle");
      fail(error.message);
      return;
    }

    setSender(values);
    setStatus("flying");
    flyPlane(() => {
      setStatus("sent");
      requestAnimationFrame(() => successHeading.current?.focus({ preventScroll: true }));
    });
  };

  const sendAnother = () => {
    form.current.reset();
    setSender(null);
    setStatus("idle");
    gsap.set(form.current.querySelectorAll("[data-field]"), { clearProps: "all" });
    form.current.elements.name.focus({ preventScroll: true });
  };

  const sent = status === "sent";
  const sending = status === "sending";

  return (
    // Form and success message share one grid cell, so swapping them never
    // changes the page height under Lenis or ScrollTrigger.
    <div data-reveal className="relative grid rounded-3xl p-5 sm:p-8 lg:p-10">
      {/* No refraction: at this size the SVG backdrop filter was the page's
          biggest frame cost, and the dots redrawing behind it re-run it every frame. */}
      <GlassBg radius={24} backgroundOpacity={0.4} refraction={false} />
      <form
        ref={form}
        onSubmit={onSubmit}
        noValidate
        inert={status === "flying" || sent}
        aria-busy={sending}
        aria-labelledby="contact-form-title"
        className={`relative col-start-1 row-start-1 flex flex-col gap-4 ${sent ? "invisible" : ""}`}
      >
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

        <div data-field className="mb-4">
          <h3
            id="contact-form-title"
            className="text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-[1.1] font-heading font-normal text-ink"
          >
            {copy.formTitle}
          </h3>
          <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-pretty text-ink/65">{copy.formIntro}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-8">
          <Field name="name" label={copy.labels.name} error={errors.name}>
            <input type="text" autoComplete="name" className={fieldClass} {...fieldProps("name", errors, clearError)} />
          </Field>
          <Field name="email" label={copy.labels.email} error={errors.email}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              className={fieldClass}
              {...fieldProps("email", errors, clearError)}
            />
          </Field>
        </div>

        <Field name="message" label={copy.labels.message} error={errors.message}>
          {/* Grows with its text (glass.css, textarea.field), so no resize handle. */}
          <textarea
            rows={2}
            data-lenis-prevent
            className={fieldClass}
            {...fieldProps("message", errors, clearError)}
          />
        </Field>

        <div data-field className="mt-4 flex items-center">
          {/* Sky liquid-glass capsule, same build as the hero CTAs (buttons.css,
              .pill--azure): cloud bank rises, sun sheen sweeps, letters roll and
              the arrow takes flight on hover. Sending: the arrow becomes a plane
              gliding over a streaming contrail, until the big paper plane
              (useContactMotion) takes over. */}
          <button
            ref={sendButton}
            type="submit"
            disabled={sending}
            data-state={sending ? "sending" : undefined}
            className="pill pill--azure send fly-host ml-auto h-12 lg:h-13"
          >
            <span className="pill__cloud" aria-hidden="true" />
            <span className="pill__glint" aria-hidden="true" />
            <span data-magnet className="pill__label">
              {sending ? copy.sending : <RollLabel text={copy.send} />}
            </span>
            <span data-magnet className="pill__icon" aria-hidden="true">
              <span className="send__icon">
                <FlightArrow icon={ArrowUpRightIcon} className="send__arrow" strokeWidth={2.6} />
                <PaperPlaneIcon className="send__plane" strokeWidth={2.4} />
              </span>
            </span>
            <span className="send__trail" aria-hidden="true" />
          </button>
        </div>
      </form>

      <PaperPlane />

      {/* Stays mounted so the live region is announced when it fills. */}
      <div
        role="status"
        className={`relative col-start-1 row-start-1 flex flex-col items-start justify-center ${sent ? "" : "pointer-events-none"}`}
      >
        {sent && sender && (
          <>
            <h3
              ref={successHeading}
              tabIndex={-1}
              className="text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] leading-[1.1] font-heading font-normal text-ink outline-none"
            >
              {copy.successTitle}
            </h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/70">
              {copy.successBody.replace("{name}", sender.name).replace("{email}", sender.email)}
            </p>
            <button
              type="button"
              onClick={sendAnother}
              className="wipe mt-8 inline-flex h-11 items-center rounded-xl border border-ink/15 px-4.5 text-sm font-semibold text-ink transition-[color,border-color,scale] duration-300 ease-ui outline-sky hover:border-ink hover:text-cloud active:scale-[0.96]"
            >
              {copy.sendAnother}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
