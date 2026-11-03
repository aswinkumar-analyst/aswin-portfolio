import { Toaster } from "sonner";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import SiteNav from "./components/layout/SiteNav";
import AboutSection from "./sections/about/AboutSection";
import DotField from "./sections/about/DotField";
import ContactSection from "./sections/contact/ContactSection";
import HeroSection from "./sections/hero/HeroSection";
import WorkSection from "./sections/work/WorkSection";

export default function App() {
  useSmoothScroll();

  return (
    <>
      <a
        href="#about"
        className="fixed top-3 left-3 z-60 -translate-y-20 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-cloud outline-sky focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <SiteNav />
      {/* Covers the content (not the nav) during a nav-link cut. See lib/scroll. */}
      <div
        id="page-veil"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 bg-cloud opacity-0"
      />
      <main className="w-full max-w-full overflow-x-clip">
        <HeroSection />
        {/* About, Work and Contact share one cream card and one dot field, so there is no
            seam between them. The sticky layer keeps the dots put while the
            content scrolls past. */}
        <div className="relative z-10 isolate overflow-clip rounded-t-[1.75rem] bg-cloud shadow-[0_-24px_60px_rgb(8_31_54/0.14)] sm:rounded-t-frame">
          <div className="pointer-events-none sticky top-0 mb-[-100svh] h-svh">
            <DotField />
          </div>
          {/* Ambient depth: soft sky glows behind the content. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-24 size-112 rounded-full bg-sky/15 blur-[120px]" />
            <div className="absolute top-[34%] -left-32 size-[30rem] rounded-full bg-sky/12 blur-[120px]" />
            <div className="absolute right-[-8rem] bottom-[22%] size-[26rem] rounded-full bg-sky/12 blur-[120px]" />
          </div>
          <AboutSection />
          <WorkSection />
          <ContactSection />
        </div>
      </main>
      <Toaster
        position="bottom-center"
        duration={6000}
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border-ink/15 !bg-cloud !font-sans !text-ink",
            error: "!text-error",
            actionButton: "!rounded-lg !bg-ink !text-cloud",
          },
        }}
      />
    </>
  );
}
