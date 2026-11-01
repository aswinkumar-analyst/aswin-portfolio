import { useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "../../components/ui/Icons";
import { projects as defaultProjects, workCopy } from "../../config/projects";
import { gsap, useGSAP } from "../../lib/gsap";
import { useProjectCarousel } from "../../hooks/useProjectCarousel";
import ProjectCard from "./ProjectCard";

const GUTTER_L = "pl-5 sm:pl-8 lg:pl-[7.5%]";
const GUTTER_R = "pr-5 sm:pr-8 lg:pr-[7.5%]";

const arrowButton =
  "grid size-12 place-items-center rounded-full border border-ink/15 bg-cloud text-ink transition-[background-color,color,scale] duration-300 ease-ui outline-sky hover:bg-ink hover:text-cloud active:scale-95";

/**
 * Work: sticky intro on the left, draggable infinite card carousel on the
 * right (stacked on mobile). Projects come from config/projects.js.
 */
export default function WorkSection({ copy = workCopy, projects = defaultProjects }) {
  const root = useRef(null);
  const { index, prev, next } = useProjectCarousel(root, projects.length);

  // Intro entrance: headline words rise out of masks, the rest fades up.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrollTrigger = { trigger: root.current, start: "top 70%", once: true };
        gsap.from("[data-word]", { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.07, scrollTrigger });
        gsap.from("[data-reveal]", {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.25,
          scrollTrigger,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const words = copy.headline.split(" ");
  const total = projects.length;

  return (
    <section
      ref={root}
      id="work"
      aria-labelledby="work-title"
      className="relative overflow-x-clip bg-paper py-24 sm:py-32 lg:py-44"
    >
      <div className={`flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16 ${GUTTER_L}`}>
        <div className="pr-5 sm:pr-8 lg:sticky lg:top-32 lg:w-[min(26rem,34%)] lg:flex-none lg:pr-0">
          <p data-reveal className="text-sm font-semibold tracking-[0.14em] text-sky uppercase">
            {copy.eyebrow}
          </p>
          <h2
            id="work-title"
            aria-label={copy.headline}
            className="mt-6 text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-ink"
          >
            {words.map((word, i) => (
              <span key={i} aria-hidden="true">
                <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span data-word className="inline-block">
                    {word}
                  </span>
                </span>{" "}
              </span>
            ))}
          </h2>
          <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            {copy.summary}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div data-reveal className={`mb-6 flex items-center justify-between gap-6 sm:mb-8 ${GUTTER_R}`}>
            <div className="flex min-w-0 flex-1 items-center gap-4" aria-live="polite">
              <span className="text-sm font-medium text-ink tabular-nums">
                {String(index + 1).padStart(2, "0")}
                <span className="text-ink/40"> / {String(total).padStart(2, "0")}</span>
              </span>
              <span className="relative hidden h-px max-w-40 flex-1 bg-ink/15 sm:block" aria-hidden="true">
                <span
                  className="absolute inset-0 origin-left bg-sky transition-transform duration-700 ease-ui"
                  style={{ transform: `scaleX(${(index + 1) / total})` }}
                />
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={prev} aria-label="Previous project" className={arrowButton}>
                <ArrowLeftIcon className="size-5" />
              </button>
              <button type="button" onClick={next} aria-label="Next project" className={arrowButton}>
                <ArrowRightIcon className="size-5" />
              </button>
            </div>
          </div>

          {/* Clips the row on the left, bleeds off the right edge of the page. */}
          <div
            data-viewport
            role="region"
            aria-roledescription="carousel"
            aria-label="Selected projects"
            tabIndex={0}
            className="cursor-grab touch-pan-y overflow-hidden py-8 -my-8 outline-sky select-none data-[dragging]:cursor-grabbing"
          >
            <ul className="flex gap-4 sm:gap-5">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
