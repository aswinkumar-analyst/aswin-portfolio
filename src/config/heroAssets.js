// Hero image layers.
//
//   sky    sky-clouds-original-crop-4280x1500.png, converted to responsive WebP by
//          `python scripts/optimize-hero-assets.py` (output in src/assets/hero/)
//   plane  design-assets/hero/cessna.webp, used as-is
//
// Pass any of these as props to <HeroSection images={{ ... }} /> to override.
import sky1280 from "../assets/hero/sky-1280.webp";
import sky2560 from "../assets/hero/sky-2560.webp";
import sky4280 from "../assets/hero/sky-4280.webp";
import plane from "../../design-assets/hero/cessna.webp";

export const heroImages = {
  sky: {
    src: sky2560,
    srcSet: `${sky1280} 1280w, ${sky2560} 2560w, ${sky4280} 4280w`,
    // The sky is object-cover on a frame much taller than the image, so it is
    // displayed at max(100vw, 285vh) wide, not 100vw.
    sizes: "max(100vw, 285vh)",
    width: 4280,
    height: 1500,
  },
  plane,
};
