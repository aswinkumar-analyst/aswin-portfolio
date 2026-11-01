import GlassSurface from "./GlassSurface";

// GlassSurface as a background layer: fills its `relative` parent, ignores the
// pointer and sits behind the content. Not clipped to the parent, so overlays
// such as the paper plane can still leave the panel.
export default function GlassBg({ radius, tint, ...props }) {
  return (
    <GlassSurface
      width="100%"
      height="100%"
      borderRadius={radius}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", ...(tint && { background: tint }) }}
      {...props}
    />
  );
}
