import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "../../components/ui/Icons";
import FlightArrow from "../../components/ui/FlightArrow";
import RollLabel from "../../components/ui/RollLabel";
import { useMagnetic } from "../../hooks/useMagnetic";
import { projects as defaultProjects, workCopy } from "../../config/projects";
import { gsap, useGSAP } from "../../lib/gsap";
import { useCaseRoute } from "../../hooks/useCaseRoute";
import { useProjectCarousel } from "../../hooks/useProjectCarousel";
import GlassBg from "../../components/ui/GlassBg";
import Eyebrow from "../../components/ui/Eyebrow";
import ProjectCard from "./ProjectCard";

// The case-study dialog (and its video player) is its own chunk, fetched the
// first time a card is hovered or focused, so it is usually ready by the click.
const loadModal = () => import("./ProjectModal");
const ProjectModal = lazy(loadModal);
const MIN_LOOP = 6; // fewer cards than this would leave a gap in the loop on wide screens

const GUTTER_L = "pl-5 sm:pl-8 lg:pl-[7.5%]";
const GUTTER_R = "pr-5 sm:pr-8 lg:pr-[7.5%]";

const arrowButton =
  "fly-host relative grid size-12 place-items-center rounded-full text-ink transition-[color,scale] duration-300 ease-ui outline-sky hover:text-sky active:scale-95";

/**
 * Work: sticky intro on the left, draggable infinite card carousel on the
 * right (stacked on mobile). Projects come from config/projects.js. A card
 * opens its case study in ProjectModal; the open case lives in ?case=.
 */
export default function WorkSection({ copy = workCopy, projects = defaultProjects }) {
  const root = useRef(null);
  const ctaRef = useRef(null);
  useMagnetic(ctaRef);
  const sourceRef = useRef(null); // the cover of the card that was clicked
  const total = projects.length;
  // A short list is repeated so the loop never shows a gap. Copies are aria-hidden.
  const loop = useMemo(
    () => Array.from({ length: Math.ceil(MIN_LOOP / total) }, () => projects).flat(),
    [projects, total],
  );
  const { index, prev, next } = useProjectCarousel(root, loop.length);
  const current = index % total;

  const ids = useMemo(() => projects.map((p) => p.id), [projects]);
  const { caseId, open, swap, close } = useCaseRoute(ids);
  const [modalUsed, setModalUsed] = useState(Boolean(caseId));
  if (caseId && !modalUsed) setModalUsed(true);

  const openCase = (id, cover) => {
    sourceRef.current = cover;
    open(id);
  };

  // The card the dialog grows out of and shrinks back into: the one clicked if
  // it still shows this project, else any card for it that is on screen.
  const getSource = useCallback((id) => {
    const clicked = sourceRef.current;
    if (clicked?.isConnected && clicked.dataset.cover === id) return clicked;
    for (const el of root.current.querySelectorAll(`[data-cover="${id}"]`)) {
      const r = el.getBoundingClientRect();
      if (r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight) return el;
    }
    return null;
  }, []);

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

  return (
    <section
      ref={root}
      id="work"
      aria-labelledby="work-title"
      className="relative pt-4 pb-24 sm:pb-32 lg:pb-44"
    >
      <div className={`flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16 ${GUTTER_L}`}>
        <div className="pr-5 sm:pr-8 lg:sticky lg:top-32 lg:w-[min(26rem,34%)] lg:flex-none lg:pr-0">
          <Eyebrow data-reveal>{copy.eyebrow}</Eyebrow>
          <h2
            id="work-title"
            aria-label={copy.headline}
            className="mt-6 text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] leading-[1.05] font-heading font-normal text-balance text-ink"
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
          {copy.cta && (
            <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <a
                ref={ctaRef}
                href={copy.cta.href}
                className="pill pill--zenith pill--trail fly-host h-12"
              >
                <span className="pill__cloud" aria-hidden="true" />
                <span className="pill__glint" aria-hidden="true" />
                <span data-magnet className="pill__label">
                  <RollLabel text={copy.cta.label} />
                </span>
                {/* The sun the arrow takes off from: pale glass at rest,
                    full daylight on hover. */}
                <span data-magnet className="pill__sun" aria-hidden="true">
                  <FlightArrow icon={ArrowUpRightIcon} className="size-[0.8em]" strokeWidth={2.6} />
                </span>
              </a>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div data-reveal className={`mb-6 flex items-center justify-between gap-6 sm:mb-8 ${GUTTER_R}`}>
            <div className="flex min-w-0 flex-1 items-center gap-4" aria-live="polite">
              <span className="text-sm font-medium text-ink tabular-nums">
                {String(current + 1).padStart(2, "0")}
                <span className="text-ink/65"> / {String(total).padStart(2, "0")}</span>
              </span>
              <span className="relative hidden h-px max-w-40 flex-1 bg-ink/15 sm:block" aria-hidden="true">
                <span
                  className="absolute inset-0 origin-left bg-sky transition-transform duration-700 ease-ui"
                  style={{ transform: `scaleX(${(current + 1) / total})` }}
                />
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={prev} aria-label="Previous project" className={arrowButton}>
                <GlassBg radius={24} backgroundOpacity={0.35} distortionScale={-100} />
                <FlightArrow icon={ArrowLeftIcon} dir="left" className="relative size-5" />
              </button>
              <button type="button" onClick={next} aria-label="Next project" className={arrowButton}>
                <GlassBg radius={24} backgroundOpacity={0.35} distortionScale={-100} />
                <FlightArrow icon={ArrowRightIcon} dir="right" className="relative size-5" />
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
            className="cursor-grab touch-pan-y overflow-x-clip outline-sky select-none data-[dragging]:cursor-grabbing"
          >
            <ul className="flex gap-4 sm:gap-5">
              {loop.map((project, i) => (
                <ProjectCard
                  key={`${project.id}-${i}`}
                  project={project}
                  index={i % total}
                  clone={i >= total}
                  onOpen={openCase}
                  onIntent={loadModal}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {modalUsed && (
        <Suspense fallback={null}>
          <ProjectModal
            projects={projects}
            caseId={caseId}
            onClose={close}
            onNavigate={swap}
            getSource={getSource}
          />
        </Suspense>
      )}
    </section>
  );
}
