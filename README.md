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
  assets/hero/               Generated: sky-*.avif/webp, sky-square-*.avif
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

## Deploying

`vercel.json` and `netlify.toml` set the same security and cache headers, so
change both together, or delete the one you don't use. Link-preview URLs use
the production address the host provides at build time. Set `SITE_URL` to
override it (for example `SITE_URL=https://example.com npm run build`).

`npm run analyze` writes a bundle treemap to `dist/stats.html`.

## Hero images

| Layer | Source (`design-assets/hero/`)           | Used as                                       |
| ----- | ---------------------------------------- | --------------------------------------------- |
| Sky   | `sky-clouds-original-crop-4280x1500.png` | `src/assets/hero/sky-*` (via the script)      |
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

- **Boot screen:** `public/loader.js` and the styles in `index.html` run before
  the bundle, so they cover the wait for it. The cube is WebGL in a worker, so
  parsing the bundle can't stall it. It holds for real steps (files, app, fonts,
  decoded sky), gives up after 10s if the app is running, and offers a reload
  after 20s if it isn't.
- **Opening:** one timeline in `hooks/useHeroReveal.js`: boot screen exit, sky,
  nav, then the headline, subtext and CTAs.
- Birds and the plane are CSS keyframes on `transform` and `opacity` only. The
  banner text is `banner` in `config/site.js`.
- With `prefers-reduced-motion: reduce` there is no boot screen, the copy shows
  at once, three birds sit still, and the banner rests in the sky.
