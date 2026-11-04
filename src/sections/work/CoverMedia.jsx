import ProjectArt from "./ProjectArt";

/**
 * A project's cover: the responsive AVIF/WebP picture when there is one,
 * otherwise the generated ProjectArt. Fills its parent (object-cover), so
 * the parent sets the frame. Shared by the card, the dialog stage and the
 * next-case link, so they all show the same crop of the same file.
 */
export default function CoverMedia({ project, sizes, loading = "lazy", fetchPriority, decorative = false, className = "" }) {
  const { cover, art } = project;
  if (!cover) return <ProjectArt {...art} />;
  return (
    <picture>
      <source type="image/avif" srcSet={cover.avif} sizes={sizes} />
      <source type="image/webp" srcSet={cover.webp} sizes={sizes} />
      <img
        src={cover.fallback}
        alt={decorative ? "" : cover.alt}
        width={cover.width}
        height={cover.height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        draggable={false}
        className={`size-full object-cover ${className}`}
      />
    </picture>
  );
}
