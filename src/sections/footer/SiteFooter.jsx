import { useRef } from "react";
import { GitHubIcon, LinkedInIcon } from "../../components/ui/Icons";
import { contactDetails } from "../../config/contact";
import { brand, footer } from "../../config/site";
import { gsap, useGSAP } from "../../lib/gsap";

const socialIcons = { LinkedIn: LinkedInIcon, GitHub: GitHubIcon };

/**
 * Site footer on ink. It tucks under the cream card (-mt matches the card's
 * corner radius), so the dark shows behind the rounded corners, and its
 * contents rise into place as the card scrolls away. Email and social links
 * come from config; empty ones are skipped.
 */
export default function SiteFooter({ links = footer.links, socials = footer.socials, email = contactDetails.email }) {
  const root = useRef(null);
  const liveSocials = socials.filter((s) => s.href);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-footer-inner]",
          { yPercent: -40, autoAlpha: 0.2 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative z-0 -mt-10 overflow-hidden bg-ink pt-10 text-cloud">
      <div
        data-footer-inner
        className="flex flex-col items-center gap-7 px-5 pt-14 pb-12 text-center sm:pt-18 sm:pb-14"
      >
        <nav aria-label="Footer">
          <ul className="m-0 flex list-none flex-wrap justify-center gap-x-7 gap-y-3 p-0">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  download={link.download}
                  className="group/link rounded-md text-[0.9375rem] font-medium tracking-[-0.01em] text-cloud/65 transition-colors duration-200 ease-ui hover:text-cloud"
                >
                  <span className="contrail">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="m-0 flex flex-wrap items-center justify-center gap-x-7 gap-y-1 text-[0.9375rem] tracking-[-0.01em]">
          <span className="text-cloud/45">
            © {new Date().getFullYear()} {brand.name}
          </span>
          {email && (
            <a
              href={`mailto:${email}`}
              className="group/link rounded-md text-cloud/85 transition-colors duration-200 ease-ui hover:text-cloud"
            >
              <span className="contrail">{email}</span>
            </a>
          )}
        </p>

        {liveSocials.length > 0 && (
          <ul className="m-0 flex list-none gap-1 p-0">
            {liveSocials.map(({ label, href }) => {
              const SocialIcon = socialIcons[label];
              return (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-xl text-cloud/65 transition-[background-color,color,scale] duration-200 ease-ui hover:bg-white/8 hover:text-cloud active:scale-[0.96]"
                  >
                    {SocialIcon ? <SocialIcon className="size-5" /> : label}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </footer>
  );
}
