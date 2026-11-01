import { planeFacets } from "../../config/contact";

// The sheet that folds into a plane. useContactMotion tweens each polygon's
// points from `sheet` to `plane`.
export default function PaperPlane() {
  return (
    <svg
      data-plane
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="invisible absolute top-1/2 left-1/2 -mt-16 -ml-16 size-32 overflow-visible drop-shadow-[0_8px_14px_rgb(8_31_54/0.16)]"
    >
      {planeFacets.map((facet) => (
        <polygon
          key={facet.fill}
          data-facet
          points={facet.sheet}
          fill={facet.fill}
          stroke="#0f68a6"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
