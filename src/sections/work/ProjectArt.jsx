import { useId } from "react";

// Generated cover art for projects without an image: a gradient plus one
// line-drawn motif in the accent colour. Purely decorative.
const SHAPES = {
  rings: (a) =>
    [60, 120, 180, 240, 300].map((r) => (
      <circle key={r} cx="300" cy="170" r={r} fill="none" stroke={a} strokeOpacity={0.34 - r / 1200} />
    )),
  grid: (a) => (
    <>
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={30 + col * 42} cy={30 + row * 42} r="2" fill={a} fillOpacity={0.45} />
        )),
      )}
      <circle cx="250" cy="200" r="90" fill={a} fillOpacity="0.14" />
      <circle cx="250" cy="200" r="90" fill="none" stroke={a} strokeOpacity="0.6" />
    </>
  ),
  waves: (a) =>
    [0, 1, 2, 3, 4, 5].map((i) => (
      <path
        key={i}
        d={`M-20 ${150 + i * 38} C 80 ${90 + i * 38}, 160 ${210 + i * 38}, 250 ${150 + i * 38} S 380 ${100 + i * 38}, 440 ${150 + i * 38}`}
        fill="none"
        stroke={a}
        strokeOpacity={0.5 - i * 0.06}
        strokeWidth="1.5"
      />
    )),
  nodes: (a) => {
    const pts = [[90, 120], [250, 80], [330, 220], [170, 260], [60, 330], [290, 380]];
    return (
      <>
        {pts.flatMap((p, i) =>
          pts.slice(i + 1).map((q, j) => (
            <line key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={a} strokeOpacity="0.2" />
          )),
        )}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 9 : 14} fill={a} fillOpacity={i % 2 ? 0.5 : 0.85} />
        ))}
      </>
    );
  },
  bars: (a) =>
    [90, 160, 120, 230, 180, 280, 210].map((h, i) => (
      <rect key={i} x={36 + i * 50} y={400 - h} width="26" height={h} rx="13" fill={a} fillOpacity={0.18 + i * 0.07} />
    )),
  orbit: (a) =>
    [0, 40, 80, 120, 160].map((deg) => (
      <ellipse
        key={deg}
        cx="200"
        cy="190"
        rx="170"
        ry="64"
        fill="none"
        stroke={a}
        strokeOpacity="0.4"
        transform={`rotate(${deg} 200 190)`}
      />
    )),
};

export default function ProjectArt({ shape, from, to, accent }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 400 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="size-full"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill={`url(#${id})`} />
      {(SHAPES[shape] ?? SHAPES.rings)(accent)}
    </svg>
  );
}
