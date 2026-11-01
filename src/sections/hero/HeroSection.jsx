import { useRef } from "react";
import { heroImages } from "../../config/heroAssets";
import { heroCopy } from "../../config/site";
import { useHeroReveal } from "../../hooks/useHeroReveal";
import Birds from "./Birds";
import HeroCopy from "./HeroCopy";
import SkyBanner from "./SkyBanner";

/**
 * Hero in a rounded sky frame, inspired by a1mobile.
 *
 * Stack, back to front: sky -> birds -> copy (z-20) -> plane banner (z-25)
 * -> frame ring (z-40). Sky, birds and plane are live from first paint; the
 * copy is revealed after a delay (see useHeroReveal). The fixed SiteNav floats
 * above the whole page.
 *
 * Props
 *   images  Override { sky, plane } (see heroAssets.js).
 *   copy    Override heroCopy from src/config/site.js.
 */
export default function HeroSection({ images = heroImages, copy = heroCopy }) {
  const root = useRef(null);
  useHeroReveal(root);

  return (
    <section
      ref={root}
      id="top"
      aria-label="Introduction"
      className="relative h-svh min-h-[34rem] w-full p-4 sm:p-6 lg:p-10"
    >
      {/* Rounded frame and size container (the cqw/cqh units used by the birds
          and plane). bg-sky shows through if the image is slow to load. */}
      <div className="relative isolate h-full w-full overflow-hidden rounded-[1.75rem] bg-sky [container-type:size] sm:rounded-frame">
        <picture data-hero="sky">
          {images.sources?.map((source) => (
            <source key={source.srcSet} {...source} />
          ))}
          <img
            {...images.sky}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover object-[62%_100%]"
          />
        </picture>

        <Birds />
        <HeroCopy copy={copy} />
        <SkyBanner text={copy.banner} plane={images.plane} />

        {/* Subtle inner border that defines the frame edge, a1mobile style. */}
        <div className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)]" />
      </div>
    </section>
  );
}
