// An arrow that takes flight: on hover or focus of the nearest `.fly-host`,
// the icon flies out along `dir` and a second copy glides in from the opposite
// side, like the paper plane crossing the sky (styles/buttons.css).
export default function FlightArrow({ icon: Icon, dir = "up-right", className = "size-4", strokeWidth }) {
  return (
    <span className={`fly fly--${dir} ${className}`} aria-hidden="true">
      <Icon className="fly__icon" strokeWidth={strokeWidth} />
      <Icon className="fly__icon" strokeWidth={strokeWidth} />
    </span>
  );
}
