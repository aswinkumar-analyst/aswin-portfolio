// Ambient flock. Pure CSS (see .bird in styles/hero.css), so it keeps flying on the
// compositor while GSAP handles the copy reveal.
//
// Each bird nests three loops: .bird glides diagonally across the frame,
// .bird__bob drifts it up and down on a sine-like curve, and the two wings
// flap. Negative delays start every bird mid-flight and out of phase.
//
//   left/top    launch point, % of the frame
//   size        wingspan in px
//   dx/dy       flight vector, in frame-relative units
//   dur/delay   glide loop, s
//   flap        wing-beat period, s (delay offsets it)
//   bob         drift period, s (delay offsets it), amplitude in px
const FLOCK = [
  { left: 7, top: 63, size: 44, dx: 80, dy: -66, dur: 19, delay: -2, flap: 0.46, flapDelay: 0, bobDur: 3.2, bobDelay: -0.4, bob: 7 },
  { left: 12, top: 68, size: 32, dx: 86, dy: -74, dur: 24, delay: -9, flap: 0.58, flapDelay: -0.2, bobDur: 4.1, bobDelay: -1.7, bob: 9 },
  { left: 6, top: 55, size: 53, dx: 78, dy: -56, dur: 16, delay: -5, flap: 0.4, flapDelay: -0.15, bobDur: 2.8, bobDelay: -0.9, bob: 6 },
  { left: 16, top: 60, size: 37, dx: 74, dy: -62, dur: 21, delay: -13, flap: 0.52, flapDelay: -0.35, bobDur: 3.6, bobDelay: -2.2, bob: 8 },
  { left: 10, top: 50, size: 28, dx: 82, dy: -48, dur: 27, delay: -3, flap: 0.62, flapDelay: -0.5, bobDur: 4.6, bobDelay: -0.3, bob: 10 },
  { left: 19, top: 66, size: 41, dx: 70, dy: -70, dur: 18, delay: -16, flap: 0.44, flapDelay: -0.1, bobDur: 3, bobDelay: -1.2, bob: 7 },
  { left: 9, top: 72, size: 34, dx: 88, dy: -80, dur: 23, delay: -20, flap: 0.55, flapDelay: -0.28, bobDur: 3.9, bobDelay: -0.7, bob: 8 },
  { left: 15, top: 47, size: 25, dx: 76, dy: -42, dur: 29, delay: -11, flap: 0.66, flapDelay: -0.42, bobDur: 5, bobDelay: -2.6, bob: 9 },
  { left: 18, top: 54, size: 39, dx: 72, dy: -54, dur: 20, delay: -7, flap: 0.49, flapDelay: -0.22, bobDur: 3.4, bobDelay: -1.9, bob: 7 },
];

const vars = (b) => ({
  left: `${b.left}%`,
  top: `${b.top}%`,
  "--size": `${b.size}px`,
  "--dx": `${b.dx}cqw`,
  "--dy": `${b.dy}cqh`,
  "--dur": `${b.dur}s`,
  "--delay": `${b.delay}s`,
  "--flap": `${b.flap}s`,
  "--flap-delay": `${b.flapDelay}s`,
  "--bob-dur": `${b.bobDur}s`,
  "--bob-delay": `${b.bobDelay}s`,
  "--bob": `${b.bob}px`,
});

export default function Birds() {
  return (
    <div
      data-hero="ambient"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 text-ink-deep/85"
    >
      {FLOCK.map((bird, i) => (
        <div key={i} className="bird" style={vars(bird)}>
          <div className="bird__bob">
            <svg viewBox="0 0 40 18" className="block w-full overflow-visible">
              <path className="wing wing--l" d="M20 9C14 4 8 3 2 6 8 6 14 8 20 9Z" fill="currentColor" />
              <path className="wing wing--r" d="M20 9C26 4 32 3 38 6 32 6 26 8 20 9Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
