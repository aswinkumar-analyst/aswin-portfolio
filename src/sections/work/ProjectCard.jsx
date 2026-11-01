import { ArrowUpRightIcon } from "../../components/ui/Icons";
import ProjectArt from "./ProjectArt";

/**
 * One tall card. The outer <li> is positioned by useProjectCarousel (inline
 * transform), so every hover/entrance effect lives on the inner layers:
 *   [data-card-in]  entrance + hover lift
 *   [data-art]      carousel parallax (the zoom lives one layer deeper)
 */
export default function ProjectCard({ project, index }) {
  const { title, client, description, tags, link, image, art } = project;

  return (
    <li data-card className="w-[78vw] max-w-[22rem] flex-none sm:w-80 lg:w-[21rem] xl:w-[23rem]">
      <div data-card-in>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          draggable={false}
          aria-label={`${title}, ${client}. Opens case study in a new tab`}
          className="group relative block aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-ink-deep ring-1 ring-ink-deep/10 transition-[translate,box-shadow] duration-500 ease-ui outline-sky hover:-translate-y-1.5 hover:shadow-[0_32px_70px_-28px_rgb(15_104_166/0.65)] focus-visible:-translate-y-1.5"
        >
          <div data-art className="absolute inset-y-0 -inset-x-[8%] will-change-transform">
            <div className="size-full transition-transform duration-700 ease-ui group-hover:scale-[1.07] group-focus-visible:scale-[1.07]">
              {image ? (
                <img src={image} alt="" draggable={false} loading="lazy" className="size-full object-cover" />
              ) : (
                <ProjectArt {...art} />
              )}
            </div>
          </div>

          {/* Legibility scrim for the copy block. */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/55 via-40% to-transparent to-65%" />
          {/* Glowing edge that fades in on hover. */}
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15 transition-[box-shadow] duration-500 ease-ui group-hover:shadow-[inset_0_0_0_1px_rgb(159_211_245/0.7),inset_0_0_40px_rgb(159_211_245/0.18)]" />

          <div className="absolute inset-x-5 top-5 flex items-center justify-between">
            <span className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium tracking-[0.12em] text-on-sky backdrop-blur-md tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-cloud text-ink transition-transform duration-500 ease-ui group-hover:scale-110 group-hover:bg-sky group-hover:text-on-sky">
              <ArrowUpRightIcon className="size-4 transition-transform duration-500 ease-ui group-hover:translate-x-px group-hover:-translate-y-px" />
            </span>
          </div>

          <div className="absolute inset-x-5 bottom-5 text-on-sky sm:inset-x-6 sm:bottom-6">
            <p className="text-xs font-medium tracking-[0.14em] text-on-sky-muted uppercase">{client}</p>
            <h3 className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.03em] text-balance">{title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-sky-muted">{description}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-glass-border bg-glass px-2.5 py-1 text-xs backdrop-blur-md"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </a>
      </div>
    </li>
  );
}
