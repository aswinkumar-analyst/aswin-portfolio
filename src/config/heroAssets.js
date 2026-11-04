// Hero image layers.
//
//   sky      src/assets/hero/, AVIF and WebP at several widths
//   sources  AVIF versions tried before `sky`, the WebP fallback. Portrait screens
//            get a square crop, so phones don't download the whole panorama.
//   plane    design-assets/hero/cessna.webp, used as-is
//
// Pass any of these as props to <HeroSection images={{ ... }} /> to override.
// The preload links in index.html repeat the AVIF lists: keep them in step.
import skyAvif1280 from "../assets/hero/sky-1280.avif";
import skyAvif2560 from "../assets/hero/sky-2560.avif";
import skyAvif3200 from "../assets/hero/sky-3200.avif";
import skyAvif4280 from "../assets/hero/sky-4280.avif";
import skySquare1000 from "../assets/hero/sky-square-1000.avif";
import skySquare1500 from "../assets/hero/sky-square-1500.avif";
import sky1280 from "../assets/hero/sky-1280.webp";
import sky2560 from "../assets/hero/sky-2560.webp";
import sky4280 from "../assets/hero/sky-4280.webp";
import plane from "../../design-assets/hero/cessna.webp";

// The sky is object-cover on a frame much taller than the image, so it is
// displayed at max(100vw, 285vh) wide, not 100vw.
const SKY_SIZES = "max(100vw, 285vh)";

export const heroImages = {
  sources: [
    {
      media: "(max-aspect-ratio: 1/1)",
      type: "image/avif",
      srcSet: `${skySquare1000} 1000w, ${skySquare1500} 1500w`,
      sizes: "100svh",
    },
    {
      type: "image/avif",
      srcSet: `${skyAvif1280} 1280w, ${skyAvif2560} 2560w, ${skyAvif3200} 3200w, ${skyAvif4280} 4280w`,
      sizes: SKY_SIZES,
    },
  ],
  sky: {
    src: sky2560,
    srcSet: `${sky1280} 1280w, ${sky2560} 2560w, ${sky4280} 4280w`,
    sizes: SKY_SIZES,
    width: 4280,
    height: 1500,
  },
  plane,
};
