import BrandIcon from "../../components/ui/BrandIcons";
import { contactCopy, socialLinks } from "../../config/contact";

// Row of glass tiles under the contact routes. Each tile lifts and fills with
// ink on hover or keyboard focus, and names itself in a small tag above it
// (styles/glass.css, .social). Entries with an empty href are skipped.
export default function SocialLinks({ links = socialLinks }) {
  const live = links.filter((link) => link.href);
  if (live.length === 0) return null;

  return (
    <div data-reveal className="mt-10 lg:mt-12">
      <p id="contact-socials" className="text-sm font-medium text-ink/60">
        {contactCopy.socialsLabel}
      </p>
      <ul aria-labelledby="contact-socials" className="m-0 mt-4 flex list-none flex-wrap gap-3 p-0">
        {live.map(({ label, href, icon }) => {
          const external = !href.startsWith("mailto:");
          return (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                className="social"
              >
                <BrandIcon name={icon} className="social__icon" />
                <span className="social__tip" aria-hidden="true">
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
