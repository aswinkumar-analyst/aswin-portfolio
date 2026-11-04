// Section badge: a sliver of the hero sky, sun and drifting clouds (styles/glass.css).
const CLOUD = (
  <svg viewBox="0 0 48 20" aria-hidden="true">
    <path d="M8 20A7 7 0 0 1 8 6a10 10 0 0 1 19-2 8 8 0 0 1 13 5 5.5 5.5 0 0 1 2 11Z" />
  </svg>
);

export default function Eyebrow({ as: Tag = "p", children, className = "", ...props }) {
  return (
    <Tag className={`eyebrow ${className}`} {...props}>
      <span className="eyebrow__sky" aria-hidden="true">
        <span className="eyebrow__cloud eyebrow__cloud--far">{CLOUD}</span>
        <span className="eyebrow__cloud eyebrow__cloud--near">{CLOUD}</span>
      </span>
      <span className="eyebrow__sun" aria-hidden="true" />
      {children}
    </Tag>
  );
}
