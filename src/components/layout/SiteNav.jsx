import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { brand, navLinks } from "../../config/site";
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from "../ui/Icons";

// Scroll distance (px) after which the bar condenses into a floating glass pill.
const SCROLL_THRESHOLD = 24;

// A section becomes current once its top crosses this share of the viewport.
const SPY_LINE = 0.4;

// The nav link whose section top most recently crossed the spy line. Picks the
// closest crossed top rather than the last in nav order, so a section nested
// inside another still wins. At the very bottom the last section wins, since a short
// final section may never reach the line. Null over the hero.
function currentSection(sections) {
  const { innerHeight, scrollY } = window;
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
    return sections.at(-1)?.href ?? null;
  }
  const line = innerHeight * SPY_LINE;
  let current = null;
  let closest = -Infinity;
  for (const { href, el } of sections) {
    const top = el.getBoundingClientRect().top;
    if (top <= line && top > closest) {
      closest = top;
      current = href;
    }
  }
  return current;
}

// Fixed site navigation. Transparent over the hero on first paint; once the
// page scrolls it narrows into a white glass pill with a blurred backdrop.
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  const listRef = useRef(null);
  const indicatorRef = useRef(null);
  const toggleRef = useRef(null);

  // Condense and scroll-spy from one rAF-throttled passive listener. Reading
  // positions on scroll (not an IntersectionObserver band) stays correct across
  // pinned sections and the instant jumps of nav-link cuts.
  useEffect(() => {
    const sections = navLinks
      .map(({ href }) => ({ href, el: document.querySelector(href) }))
      .filter(({ el }) => el);
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
      setActive(currentSection(sections));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close the mobile menu on Escape (focus back to the toggle), and when the
  // desktop layout takes over.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
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

  // One indicator, one rule: it sits under the hovered/focused link if there is
  // one, otherwise under the current section's link. So a section change while
  // the pointer rests on another link never pulls the pill away from it.
  // Written straight to the element: no re-render per hover.
  const target = hovered ?? active;
  useLayoutEffect(() => {
    const pill = indicatorRef.current;
    const el = target && listRef.current?.querySelector(`[data-href="${target}"]`);
    if (!pill) return;
    if (el) {
      pill.style.translate = `${el.offsetLeft}px 0`;
      pill.style.width = `${el.offsetWidth}px`;
    }
    pill.style.opacity = el ? "1" : "0";
  }, [target]);

  // Any link in the header (brand, sections, CTA) closes the mobile menu, as
  // does a tap on the bare header area around the bar.
  const onHeaderClick = (event) => {
    if (event.target === event.currentTarget || event.target.closest("a")) setMenuOpen(false);
  };

  const focusRing = scrolled ? "focus-visible:outline-sky" : "";

  return (
    <header
      onClick={onHeaderClick}
      className={`fixed inset-x-0 top-0 z-50 px-4 transition-[padding] duration-500 ease-ui motion-reduce:transition-none sm:px-6 lg:px-10 ${
        scrolled ? "pt-3 sm:pt-4" : "pt-4 sm:pt-6 lg:pt-10"
      }`}
    >
      {/* Dims the page behind the open mobile menu; a tap anywhere on it closes
          the menu. Behind the bar and panel (header is its stacking context). */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 -z-10 bg-ink/30 transition-opacity duration-300 ease-ui motion-reduce:transition-none lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <nav
        aria-label="Primary"
        className={`relative mx-auto flex items-center justify-between rounded-2xl border transition-[width,height,padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-ui motion-reduce:transition-none ${
          scrolled
            ? "h-14 w-[95%] border-white/70 bg-white/60 px-3 pl-5 text-ink shadow-[0_10px_34px_rgb(2_30_50/0.16),0_0_0_1px_rgb(8_31_54/0.05),inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-xl backdrop-brightness-110 backdrop-saturate-150 sm:px-4 sm:pl-6 lg:h-16 lg:px-4 lg:pl-7"
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
          onMouseLeave={() => setHovered(null)}
          onBlur={() => setHovered(null)}
          className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex"
        >
          <li
            ref={indicatorRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 my-auto h-9 rounded-xl opacity-0 transition-[translate,width,opacity,background-color] duration-300 ease-ui motion-reduce:transition-none ${
              scrolled ? "bg-sky/10" : "bg-white/15"
            }`}
          />
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-href={link.href}
                aria-current={active === link.href ? "true" : undefined}
                onMouseEnter={() => setHovered(link.href)}
                onFocus={() => setHovered(link.href)}
                className={`relative flex h-9 items-center rounded-xl px-4 text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-300 ease-ui ${focusRing}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <button
            ref={toggleRef}
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
