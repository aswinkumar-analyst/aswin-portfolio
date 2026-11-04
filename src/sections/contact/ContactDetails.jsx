import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, MailIcon, PhoneIcon } from "../../components/ui/Icons";
import { contactDetails } from "../../config/contact";

// Copy and check share one cell and cross-fade (opacity, scale, blur).
const swapIcon = "col-start-1 row-start-1 size-4 transition-[opacity,scale,filter] duration-300 ease-ui";

// One direct route. The link is stretched over the whole row (after:inset-0),
// so the chip, label and value are all one big target; `action` sits above it.
function Route({ icon: RouteIcon, label, href, value, action }) {
  return (
    <li data-reveal className="route group/route relative flex items-center gap-4 rounded-2xl p-3">
      <span className="route__chip" aria-hidden="true">
        <RouteIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink/60">{label}</p>
        <a
          href={href}
          className="group/link mt-0.5 block rounded-md text-base font-medium break-all text-ink outline-sky transition-colors duration-200 ease-ui after:absolute after:inset-0 after:rounded-2xl group-hover/route:text-sky"
        >
          <span className="contrail">{value}</span>
        </a>
      </div>
      {action}
    </li>
  );
}

// Direct routes beside the form. Empty values in config/contact.js are skipped.
export default function ContactDetails({ details = contactDetails }) {
  const { email, phone } = details;
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!email && !phone) return null;

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
    <ul className="m-0 mt-10 -ml-3 flex list-none flex-col gap-2 p-0 lg:mt-12">
      {email && (
        <Route
          icon={MailIcon}
          label="Email"
          href={`mailto:${email}`}
          value={email}
          action={
            <button
              type="button"
              onClick={copyEmail}
              aria-label={copied ? "Email address copied" : "Copy email address"}
              className={`relative z-10 grid size-9 flex-none place-items-center rounded-xl outline-sky transition-[background-color,color,scale] duration-200 ease-ui after:absolute after:-inset-1 hover:bg-sky/10 hover:text-sky active:scale-[0.96] ${
                copied ? "text-sky" : "text-ink/55"
              }`}
            >
              <CopyIcon className={`${swapIcon} ${copied ? "scale-25 opacity-0 blur-[4px]" : ""}`} />
              <CheckIcon strokeWidth={2.25} className={`${swapIcon} ${copied ? "" : "scale-25 opacity-0 blur-[4px]"}`} />
            </button>
          }
        />
      )}
      {phone && (
        <Route icon={PhoneIcon} label="Phone" href={`tel:${phone.replace(/[^\d+]/g, "")}`} value={phone} />
      )}
    </ul>
  );
}
