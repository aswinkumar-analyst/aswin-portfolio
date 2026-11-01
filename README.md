# aswin-portfolio

React 19 + Vite + Tailwind CSS v4 + GSAP.

```bash
npm install
npm run dev
```

## Structure

```text
design-assets/hero/          Source art: sky PNGs and cessna.webp. Never edited.
scripts/
  optimize-hero-assets.py    Converts the sky PNG into responsive WebP
designs/                     Design docs and reference snippets
src/
  main.jsx, App.jsx          Entry point and page composition
  assets/hero/               Generated: sky-1280/2560/4280.webp
  config/                    Static data
    site.js                  Brand, nav links, CTAs, hero copy and banner text
    heroAssets.js            Image imports and responsive sky srcset
    frame.js                 Shared horizontal gutter
  lib/gsap.js                Registers GSAP plugins once; import gsap from here
  hooks/useHeroReveal.js     Timed GSAP reveal of the copy
  styles/
    index.css                Design tokens (@theme), fonts, base styles
    hero.css                 Bird flock and sky banner keyframes
  components/                Reusable, page-agnostic pieces
    layout/SiteNav.jsx       Site navigation, mobile menu
    ui/Icons.jsx             Authored SVG icons
  sections/                  Page sections, one folder each
    hero/                    HeroSection (entry), HeroCopy, Birds, SkyBanner
    work/WorkSection.jsx     Placeholder section after the hero
```

## Hero images

| Layer | Source (`design-assets/hero/`)           | Used as                                       |
| ----- | ---------------------------------------- | --------------------------------------------- |
| Sky   | `sky-clouds-original-crop-4280x1500.png` | `src/assets/hero/sky-*.webp` (via the script) |
| Plane | `cessna.webp`                            | Imported directly                             |

To change the sky, replace the source PNG and run:

```bash
pip install pillow
python scripts/optimize-hero-assets.py
```

Any layer can also be overridden with a prop:

```jsx
<HeroSection images={{ ...heroImages, plane: myPlane }} />
```

## Hero motion

- **Immediately:** sky, birds, plane banner and nav.
- **After 4 seconds:** the headline, subtext and CTAs fade up
  (`REVEAL_DELAY` in `hooks/useHeroReveal.js`).
- Birds and the plane are CSS keyframes on `transform` and `opacity` only. The
  banner text is `banner` in `config/site.js`.
- With `prefers-reduced-motion: reduce` the copy shows at once, three birds sit
  still, and the banner rests in the sky.
