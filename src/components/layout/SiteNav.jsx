import { useCallback, useEffect, useRef, useState } from "react";
import { brand, navCta, navLinks } from "../../config/site";
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from "../ui/Icons";

// Scroll distance (px) after which the bar condenses into a floating glass pill.
const SCROLL_THRESHOLD = 24;

// Fixed site navigation. Transparent over the hero on first paint; once the
// page scrolls it narrows into a white glass pill with a blurred backdrop.
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, visible: false });
  const listRef = useRef(null);

  // Condense on scroll. One rAF-throttled passive listener.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close the mobile menu on Escape, and when the desktop layout takes over.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

  // Scroll-spy: highlight the link whose section crosses the viewport middle.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          const href = `#${target.id}`;
          setActive((prev) => (isIntersecting ? href : prev === href ? null : prev));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { href } of navLinks) {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  // Slide the hover/active indicator under a link (or hide it).
  const place = useCallback((el) => {
    if (!el) return setIndicator((prev) => ({ ...prev, visible: false }));
    setIndicator({ x: el.offsetLeft, w: el.offsetWidth, visible: true });
  }, []);

  const placeActive = useCallback(() => {
    const el = active && listRef.current?.querySelector(`[data-href="${active}"]`);
    place(el);
  }, [active, place]);

  useEffect(placeActive, [placeActive]);

  const closeMenu = () => setMenuOpen(false);

  const focusRing = scrolled ? "focus-visible:outline-sky" : "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-4 transition-[padding] duration-500 ease-ui motion-reduce:transition-none sm:px-6 lg:px-10 ${
        scrolled ? "pt-3 sm:pt-4" : "pt-4 sm:pt-6 lg:pt-10"
      }`}
    >
      <nav
        aria-label="Primary"
        className={`relative mx-auto flex items-center justify-between rounded-2xl border transition-[width,height,padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-ui motion-reduce:transition-none ${
          scrolled
            ? "h-14 w-[95%] border-white/50 bg-white/45 px-3 pl-5 text-ink shadow-[0_10px_34px_rgb(2_30_50/0.14),inset_0_1px_0_rgb(255_255_255/0.7)] backdrop-blur-2xl backdrop-brightness-110 backdrop-saturate-150 sm:px-4 sm:pl-6 lg:h-16 lg:px-4 lg:pl-7"
            : "h-18 w-full border-transparent bg-transparent px-5 text-on-sky shadow-[0_0_0_rgb(2_30_50/0)] backdrop-blur-0 sm:px-8 lg:h-24 lg:px-[7.5%]"
        }`}
      >
        <a
          href={brand.href}
          className={`flex items-center gap-2 rounded-lg text-[1.0625rem] font-semibold tracking-[-0.02em] ${focusRing}`}
        >
          {brand.name}
        </a>

        {/* Desktop links, centred on the bar rather than between siblings. */}
        <ul
          ref={listRef}
          onMouseLeave={placeActive}
          onBlur={placeActive}
          className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex"
        >
          <span
            aria-hidden="true"
            style={{ translate: `${indicator.x}px 0`, width: indicator.w }}
            className={`pointer-events-none absolute inset-y-0 left-0 my-auto h-9 rounded-xl transition-[translate,width,opacity,background-color] duration-300 ease-ui motion-reduce:transition-none ${
              indicator.visible ? "opacity-100" : "opacity-0"
            } ${scrolled ? "bg-sky/10" : "bg-white/15"}`}
          />
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-href={link.href}
                aria-current={active === link.href ? "true" : undefined}
                onMouseEnter={(e) => place(e.currentTarget)}
                onFocus={(e) => place(e.currentTarget)}
                className={`relative flex h-9 items-center rounded-xl px-4 text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-300 ease-ui ${focusRing}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <a
            href={navCta.href}
            className={`group/cta inline-flex h-10 items-center gap-1.5 rounded-xl border px-4.5 text-sm font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,scale] duration-200 ease-ui active:scale-[0.96] ${focusRing} ${
              scrolled
                ? "border-sky bg-sky text-on-sky hover:border-sky-deep hover:bg-sky-deep"
                : "border-glass-border bg-glass text-on-sky shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-md hover:bg-white/25"
            }`}
          >
            {navCta.label}
            <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 ease-ui group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={`relative grid size-11 place-items-center rounded-xl transition-[background-color,scale] duration-200 ease-ui active:scale-[0.96] lg:hidden ${focusRing} ${
              scrolled ? "hover:bg-sky/10" : "hover:bg-white/15"
            }`}
          >
            <MenuIcon
              className={`col-start-1 row-start-1 size-5 transition-[opacity,rotate,scale] duration-300 ease-ui ${
                menuOpen ? "scale-50 rotate-90 opacity-0" : ""
              }`}
            />
            <CloseIcon
              className={`col-start-1 row-start-1 size-5 transition-[opacity,rotate,scale] duration-300 ease-ui ${
                menuOpen ? "" : "scale-50 -rotate-90 opacity-0"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile / tablet menu panel. Stays mounted so it can animate in and out. */}
      <div
        id="site-mobile-menu"
        inert={!menuOpen}
        className={`mx-auto mt-2 w-[95%] origin-top transition-[opacity,translate,scale,visibility] duration-300 ease-ui motion-reduce:transition-none lg:hidden ${
          menuOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.97] opacity-0"
        }`}
      >
        <ul
          className={`rounded-2xl border p-2 backdrop-blur-2xl backdrop-saturate-150 ${
            scrolled
              ? "border-white/50 bg-white/60 text-ink shadow-[0_14px_40px_rgb(2_30_50/0.16)]"
              : "border-glass-border bg-sky-deep/85 text-on-sky shadow-[0_12px_32px_rgb(2_30_50/0.3)]"
          }`}
        >
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              style={{ transitionDelay: menuOpen ? `${60 + i * 45}ms` : "0ms" }}
              className={`transition-[opacity,translate] duration-300 ease-ui ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
              }`}
            >
              <a
                href={link.href}
                onClick={closeMenu}
                aria-current={active === link.href ? "true" : undefined}
                className={`flex h-13 items-center justify-between rounded-xl px-4 text-lg font-medium tracking-[-0.015em] transition-colors duration-200 ease-ui ${focusRing} ${
                  scrolled ? "hover:bg-sky/10 aria-[current]:bg-sky/10" : "hover:bg-white/10 aria-[current]:bg-white/10"
                }`}
              >
                {link.label}
                <ArrowUpRightIcon className="size-4 opacity-50" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
