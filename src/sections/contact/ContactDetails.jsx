import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowUpRightIcon, CheckIcon, CopyIcon } from "../../components/ui/Icons";
import { contactDetails } from "../../config/contact";
import FlightArrow from "../../components/ui/FlightArrow";
import GlassBg from "../../components/ui/GlassBg";

// The contrail underline draws in under the text on hover (styles/buttons.css).
const linkClass =
  "group/link fly-host inline-flex items-center gap-1 rounded-md text-base font-medium text-ink outline-sky transition-colors duration-200 ease-ui hover:text-sky";

// Copy and check share one cell and cross-fade (opacity, scale, blur).
const swapIcon = "col-start-1 row-start-1 size-4 transition-[opacity,scale,filter] duration-300 ease-ui";

function Detail({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-ink/70">{label}</dt>
      <dd className="m-0 mt-1.5 flex items-center gap-2">{children}</dd>
    </div>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      <span className="contrail">{children}</span>
      <FlightArrow icon={ArrowUpRightIcon} className="size-3.5" />
    </a>
  );
}

// Direct routes, below the form. Empty values in config/contact.js are skipped.
export default function ContactDetails({ details = contactDetails }) {
  const { email, phone, location, linkedin, github } = details;
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!email && !phone && !location && !linkedin && !github) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email address copied.");
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy. Select the address instead.");
    }
  };

  return (
    <div data-reveal className="relative rounded-3xl">
    <GlassBg radius={24} backgroundOpacity={0.4} refraction={false} />
    <dl className="relative m-0 grid grid-cols-1 gap-x-10 gap-y-6 p-6 sm:grid-cols-2 sm:p-8 lg:flex lg:flex-wrap lg:justify-between">
      {email && (
        <Detail label="Email">
          <a href={`mailto:${email}`} className={`${linkClass} min-w-0 break-all`}>
            <span className="contrail">{email}</span>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-label={copied ? "Email address copied" : "Copy email address"}
            className={`relative grid size-8 flex-none place-items-center rounded-lg outline-sky transition-[background-color,color,scale] duration-200 ease-ui after:absolute after:-inset-1.5 hover:bg-sky/10 hover:text-sky active:scale-[0.96] ${
              copied ? "text-sky" : "text-ink/60"
            }`}
          >
            <CopyIcon className={`${swapIcon} ${copied ? "scale-25 opacity-0 blur-[4px]" : ""}`} />
            <CheckIcon strokeWidth={2.25} className={`${swapIcon} ${copied ? "" : "scale-25 opacity-0 blur-[4px]"}`} />
          </button>
        </Detail>
      )}
      {phone && (
        <Detail label="Phone">
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
            <span className="contrail">{phone}</span>
          </a>
        </Detail>
      )}
      {location && (
        <Detail label="Location">
          <span className="text-base font-medium text-ink">{location}</span>
        </Detail>
      )}
      {linkedin && (
        <Detail label="LinkedIn">
          <ExternalLink href={linkedin}>Profile</ExternalLink>
        </Detail>
      )}
      {github && (
        <Detail label="GitHub">
          <ExternalLink href={github}>Profile</ExternalLink>
        </Detail>
      )}
    </dl>
    </div>
  );
}
