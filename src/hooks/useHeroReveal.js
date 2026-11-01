import { gsap, useGSAP } from "../lib/gsap";

// The opening sequence, one timeline from boot screen to hero:
//   exit      the boot cube rushes past the camera and its screen clears
//   sky       the sky settles from a slow push-in; birds and the plane fade up
//   nav       the bar drops in
//   headline  letters rise out of masks, then the subtext and CTAs
// It waits on window.__boot (see public/loader.js), which this hook also tells
// when the app, fonts and sky are ready. Only transform and opacity animate.
// autoAlpha also flips visibility, which keeps the hidden CTAs out of the tab
// order until they appear.
//
// useGSAP wraps everything in a gsap.context, so the tweens are reverted on
// unmount. With prefers-reduced-motion there is no boot screen or sequence: the
// finished hero is simply shown.
export function useHeroReveal(scope) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const mm = gsap.matchMedia();
      const boot = window.__boot;
      // loader.js failed to load: don't leave its screen over the site.
      if (!boot) document.getElementById("loader")?.remove();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const loader = document.getElementById("loader");
        const sky = q("[data-hero='sky'] img")[0];
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "expo.out", immediateRender: true },
        });

        tl.addLabel("exit", 0);
        if (loader) {
          tl.call(boot.leave, null, "exit").to(
            loader,
            { autoAlpha: 0, duration: 0.55, ease: "none", immediateRender: false, onComplete: boot.finish },
            "exit+=0.6",
          );
        }

        tl.addLabel("sky", "exit+=0.65")
          .from(sky, { scale: 1.2, duration: 2.4 }, "sky")
          .from(q("[data-hero='ambient']"), { autoAlpha: 0, duration: 1.4, ease: "none" }, "sky+=0.5")
          .addLabel("nav", "sky+=0.7")
          .from(
            document.querySelector("header"), // outside this hook's scope, so not a selector string
            { yPercent: -120, autoAlpha: 0, duration: 1.1, clearProps: "transform" },
            "nav",
          )
          .addLabel("headline", "sky+=1")
          .from(q("[data-hero='char']"), { yPercent: 115, duration: 1.2, stagger: 0.022 }, "headline")
          .from(
            q('[data-hero="subtext"], [data-hero="ctas"]'),
            { y: 28, autoAlpha: 0, duration: 1, stagger: 0.14 },
            "headline+=0.7",
          );

        let cancelled = false;
        (boot?.ready ?? Promise.resolve()).then(() => cancelled || tl.play());

        boot?.mark("app");
        document.fonts.ready.then(() => boot?.mark("type"));
        const onSky = () => boot?.mark("sky");
        sky.decode().then(onSky, onSky);

        return () => {
          cancelled = true;
        };
      });

      return () => mm.revert();
    },
    { scope },
  );
}
