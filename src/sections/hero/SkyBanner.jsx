// A plane towing a paper banner across the sky. Pure CSS (see .sky-banner in
// styles/hero.css); decorative, since the same message is in the copy and CTAs.
export default function SkyBanner({ text, plane }) {
  return (
    <div data-hero="ambient" aria-hidden="true" className="sky-banner">
      <div className="sky-banner__inner">
        <img src={plane} width={164} height={102} alt="" className="sky-banner__plane" />
        <span className="sky-banner__rope" />
        <span className="sky-banner__flag">{text}</span>
      </div>
    </div>
  );
}
