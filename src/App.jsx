import { useSmoothScroll } from "./hooks/useSmoothScroll";
import SiteNav from "./components/layout/SiteNav";
import AboutSection from "./sections/about/AboutSection";
import DotField from "./sections/about/DotField";
import HeroSection from "./sections/hero/HeroSection";
import WorkSection from "./sections/work/WorkSection";

export default function App() {
  useSmoothScroll();

  return (
    <>
      <SiteNav />
      <main className="w-full max-w-full overflow-x-clip">
        <HeroSection />
        {/* About + Work share one cream card and one dot field, so there is no
            seam between them. The sticky layer keeps the dots put while the
            content scrolls past. */}
        <div className="relative z-10 isolate overflow-clip rounded-t-[1.75rem] bg-cloud shadow-[0_-24px_60px_rgb(8_31_54/0.14)] sm:rounded-t-frame">
          <div className="pointer-events-none sticky top-0 mb-[-100svh] h-svh">
            <DotField />
          </div>
          <AboutSection />
          <WorkSection />
        </div>
      </main>
    </>
  );
}
