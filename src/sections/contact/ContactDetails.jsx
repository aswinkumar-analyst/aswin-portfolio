import { toast } from "sonner";
import { ArrowUpRightIcon, CopyIcon } from "../../components/ui/Icons";
import { contactDetails } from "../../config/contact";
import GlassBg from "../../components/ui/GlassBg";

const linkClass =
  "group/link inline-flex items-center gap-1 rounded-md text-base font-medium text-ink outline-sky transition-colors duration-200 ease-ui hover:text-sky";

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
      {children}
      <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 ease-ui group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none" />
    </a>
  );
}

// Direct routes, below the form. Empty values in config/contact.js are skipped.
export default function ContactDetails({ details = contactDetails }) {
  const { email, phone, location, linkedin, github } = details;
  if (!email && !phone && !location && !linkedin && !github) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email address copied.");
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
            {email}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-label="Copy email address"
            className="relative grid size-8 flex-none place-items-center rounded-lg text-ink/60 outline-sky transition-[background-color,color] duration-200 ease-ui after:absolute after:-inset-1.5 hover:bg-sky/10 hover:text-sky"
          >
            <CopyIcon className="size-4" />
          </button>
        </Detail>
      )}
      {phone && (
        <Detail label="Phone">
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
            {phone}
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
