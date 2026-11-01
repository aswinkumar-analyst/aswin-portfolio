import { useSmoothScroll } from "./hooks/useSmoothScroll";
import SiteNav from "./components/layout/SiteNav";
import AboutSection from "./sections/about/AboutSection";
import HeroSection from "./sections/hero/HeroSection";
import WorkSection from "./sections/work/WorkSection";

export default function App() {
  useSmoothScroll();

  return (
    <>
      <SiteNav />
      <main className="w-full max-w-full overflow-x-clip">
        <HeroSection />
        <AboutSection />
        <WorkSection />
      </main>
    </>
  );
}
