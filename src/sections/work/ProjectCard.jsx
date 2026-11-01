import { ArrowUpRightIcon } from "../../components/ui/Icons";
import { gsap } from "../../lib/gsap";
import ProjectArt from "./ProjectArt";

const TILT = 9; // max degrees of tilt toward the pointer

/**
 * One tall glass card. The <li> is positioned by useProjectCarousel (inline
 * transform), so all other effects live on inner layers:
 *   [data-card-in]  entrance
 *   [data-tilt]     3D tilt toward the mouse (GSAP)
 *   <a>             5px hover lift (CSS translate) + glare / edge glow that
 *                   follow the pointer through --mx / --my, art parallax via --px / --py
 *   [data-art]      carousel parallax (zoom + pointer shift live one layer deeper)
 * Mouse only: touch and reduced-motion users get the static glass card.
 */
export default function ProjectCard({ project, index }) {
  const { title, client, description, tags, link, image, art } = project;

  const move = (e) => {
    if (e.pointerType !== "mouse") return;
    const a = e.currentTarget;
    const r = a.closest("[data-card]").getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    a.style.setProperty("--mx", `${e.clientX - r.left}px`);
    a.style.setProperty("--my", `${e.clientY - r.top}px`);
    a.style.setProperty("--px", ((px - 0.5) * 2).toFixed(3));
    a.style.setProperty("--py", ((py - 0.5) * 2).toFixed(3));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(a.parentElement, {
      rotateY: (px - 0.5) * TILT * 2,
      rotateX: -(py - 0.5) * TILT * 2,
      transformPerspective: 900,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const leave = (e) => {
    const a = e.currentTarget;
    a.style.setProperty("--px", "0");
    a.style.setProperty("--py", "0");
    gsap.to(a.parentElement, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "power3.out", overwrite: "auto" });
  };

  return (
    <li data-card className="flex w-[78vw] max-w-[22rem] flex-none sm:w-80 lg:w-[21rem] xl:w-[23rem]">
      <div data-card-in className="w-full">
        <div data-tilt className="h-full">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onPointerMove={move}
            onPointerLeave={leave}
            aria-label={`${title}, ${client}. Opens case study in a new tab`}
            className="glass group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] transition-[translate,box-shadow,background-color] duration-500 ease-ui outline-sky hover:-translate-y-[5px] hover:bg-white/30 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_0_0_1px_rgb(15_104_166/0.2),0_22px_44px_-16px_rgb(8_31_54/0.3)] focus-visible:-translate-y-[5px]"
          >
            <div className="relative aspect-[5/4] overflow-hidden bg-ink-deep">
              <div data-art className="absolute inset-y-0 -inset-x-[8%] will-change-transform">
                <div className="size-full translate-x-[calc(var(--px,0)*-10px)] translate-y-[calc(var(--py,0)*-8px)] transition-[scale,translate] duration-700 ease-ui group-hover:scale-[1.1] group-focus-visible:scale-[1.1]">
                  {image ? (
                    <img src={image} alt="" draggable={false} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <ProjectArt {...art} />
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/45 to-transparent to-50%" />

              <span className="absolute top-4 left-4 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium tracking-[0.12em] text-on-sky backdrop-blur-md tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-cloud text-ink transition-[scale,background-color,color] duration-500 ease-ui group-hover:scale-110 group-hover:bg-sky group-hover:text-on-sky">
                <ArrowUpRightIcon className="size-4 transition-transform duration-500 ease-ui group-hover:translate-x-px group-hover:-translate-y-px" />
              </span>
            </div>

            <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
              <p className="text-xs font-medium tracking-[0.14em] text-sky uppercase">{client}</p>
              <h3 className="mt-2 text-2xl leading-tight font-heading font-normal text-balance text-ink">
                {title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/65">{description}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-ink/10 bg-white/50 px-2.5 py-1 text-xs text-ink/75"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pointer glare and glowing edge (hover only, see work.css). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 ease-ui group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgb(255 255 255 / 0.14), transparent 70%)",
              }}
            />
            <div aria-hidden="true" className="card-edge" />
          </a>
        </div>
      </div>
    </li>
  );
}
