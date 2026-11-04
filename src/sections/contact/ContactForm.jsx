import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowUpRightIcon, PaperPlaneIcon } from "../../components/ui/Icons";
import FlightArrow from "../../components/ui/FlightArrow";
import { contactCopy as copy, contactDetails, formConfig } from "../../config/contact";
import { gsap } from "../../lib/gsap";
import { submitContact } from "../../lib/submitContact";
import GlassBg from "../../components/ui/GlassBg";
import CaptchaField from "./CaptchaField";
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

function Field({ name, label, error, children }) {
  return (
    <div data-field className="flex flex-col">
      <label htmlFor={`contact-${name}`} className="text-sm font-medium text-ink/70">
        {label}
      </label>
      {children}
      {error && (
        <p id={`contact-${name}-error`} className="mt-2 text-sm text-error">
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
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    onChange: () => clearError(name),
  };
}

/** The form itself. status: idle > sending > flying > sent. */
export default function ContactForm({ flyPlane }) {
  const form = useRef(null);
  const captcha = useRef(null);
  const successHeading = useRef(null);

  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [started, setStarted] = useState(false);
  const [token, setToken] = useState(null);
  const [sender, setSender] = useState(null);

  const clearError = (name) => setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

  const resetCaptcha = () => {
    setToken(null);
    captcha.current?.resetCaptcha();
  };

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
      topic: data.get("topic"),
      message: data.get("message").trim(),
    };

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.current.elements[firstInvalid].focus();
      return;
    }
    if (!token) {
      setStarted(true);
      fail("Please complete the security check first.");
      return;
    }

    setStatus("sending");
    try {
      await submitContact({ ...values, captchaToken: token });
    } catch (error) {
      resetCaptcha(); // tokens are single use
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
    resetCaptcha();
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
    <div data-reveal className="relative grid rounded-3xl p-5 sm:p-8">
      {/* No refraction: at this size the SVG backdrop filter was the page's
          biggest frame cost, and the dots redrawing behind it re-run it every frame. */}
      <GlassBg radius={24} backgroundOpacity={0.4} refraction={false} />
      <form
        ref={form}
        onSubmit={onSubmit}
        onFocus={() => setStarted(true)}
        noValidate
        inert={status === "flying" || sent}
        aria-busy={sending}
        className={`relative col-start-1 row-start-1 flex flex-col gap-8 ${sent ? "invisible" : ""}`}
      >
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

        <fieldset data-field className="m-0 min-w-0 border-0 p-0">
          <legend className="p-0 text-sm font-medium text-ink/70">{copy.topicLegend}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {copy.topics.map((topic, i) => (
              <label key={topic} className="cursor-pointer">
                <input type="radio" name="topic" value={topic} defaultChecked={i === 0} className="peer sr-only" />
                <span className="inline-flex h-10 items-center rounded-xl border border-ink/15 px-4 text-sm font-medium text-ink/70 transition-[background-color,border-color,color] duration-200 ease-ui peer-checked:border-sky peer-checked:bg-sky peer-checked:text-on-sky peer-checked:shadow-[0_0_0_4px_rgb(15_104_166/0.16)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sky hover:border-ink/40">
                  {topic}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
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
          <textarea
            rows={4}
            data-lenis-prevent
            className={`${fieldClass} resize-y`}
            {...fieldProps("message", errors, clearError)}
          />
        </Field>

        <div data-field className="flex min-h-19.5 flex-wrap items-center justify-between gap-4">
          {/* Sized for the widget before it loads (it mounts on first focus), so
              nothing below shifts: 78px normal, 144px compact (<380px, see
              CaptchaField). Full width on phones keeps the button on its own row
              whether or not the widget is there yet. */}
          <div className="min-h-19.5 w-full max-[379px]:min-h-36 sm:w-auto">
            {started && (
              <CaptchaField
                ref={captcha}
                onVerify={setToken}
                onExpire={() => setToken(null)}
                onError={() => {
                  setToken(null);
                  fail("The security check didn't load. Refresh the page and try again.");
                }}
              />
            )}
          </div>
          <button
            type="submit"
            disabled={sending}
            data-state={sending ? "sending" : undefined}
            className="send fly-host relative ml-auto inline-flex h-12 items-center gap-2.5 rounded-xl px-6 text-[0.9375rem] font-semibold tracking-[-0.01em] text-on-sky transition-[scale,filter] duration-200 ease-ui outline-sky hover:brightness-110 active:scale-[0.96] disabled:cursor-progress disabled:hover:brightness-100"
          >
            {/* No refraction: under an 88% tint it was invisible, yet the SVG
                backdrop filter re-ran every frame the dot field redrew. */}
            <GlassBg radius={12} tint="rgb(15 104 166 / 0.88)" backgroundOpacity={0.1} refraction={false} />
            <span className="relative">{sending ? copy.sending : copy.send}</span>
            {/* Idle: the arrow takes flight on hover. Sending: it becomes a
                plane gliding over a streaming contrail, until the big paper
                plane (useContactMotion) takes over. */}
            <span className="send__icon" aria-hidden="true">
              <FlightArrow icon={ArrowUpRightIcon} className="send__arrow" />
              <PaperPlaneIcon className="send__plane" />
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
