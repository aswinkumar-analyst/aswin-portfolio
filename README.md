# aswin-portfolio

React 19 + Vite + Tailwind CSS v4 + GSAP.

```bash
npm install
npm run dev
```

## Structure

```text
design-assets/hero/          cessna.webp, the plane in the sky banner
public/                      loader.js (boot screen), resume.pdf, og.jpg, favicon.svg
src/
  main.jsx, App.jsx          Entry point and page composition
  assets/hero/               Sky images: sky-*.avif/webp, sky-square-*.avif
  assets/works/web/          Work section covers, stills and videos
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

| Layer | File                                    | Notes                                                  |
| ----- | --------------------------------------- | ------------------------------------------------------ |
| Sky   | `src/assets/hero/sky-*`                 | AVIF + WebP widths, plus square crops for portrait     |
| Plane | `design-assets/hero/cessna.webp`        | Imported directly                                      |

To change the sky, replace those files at the same names and sizes (the
preload links in `index.html` list the AVIF ones). Any layer can also be overridden with a prop:

```jsx
<HeroSection images={{ ...heroImages, plane: myPlane }} />
```

## Hero motion

- **Boot screen:** `public/loader.js` and the styles in `index.html` run before
  the bundle, so they cover the wait for it. The ASCII hands are a 2D canvas in
  a worker, so parsing the bundle can't stall it; their cell map and build order
  are baked into the file. It holds for real steps (files, app, fonts,
  decoded sky), gives up after 10s if the app is running, and offers a reload
  after 20s if it isn't.
- **Opening:** one timeline in `hooks/useHeroReveal.js`: boot screen exit, sky,
  nav, then the headline, subtext and CTAs.
- Birds and the plane are CSS keyframes on `transform` and `opacity` only. The
  banner text is `banner` in `config/site.js`.
- With `prefers-reduced-motion: reduce` there is no boot screen, the copy shows
  at once, three birds sit still, and the banner rests in the sky.
