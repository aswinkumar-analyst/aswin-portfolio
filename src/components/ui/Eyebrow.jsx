// Section badge: glass pill with a pulsing dot (styles/glass.css).
export default function Eyebrow({ as: Tag = "p", children, className = "", ...props }) {
  return (
    <Tag className={`eyebrow ${className}`} {...props}>
      <span className="eyebrow__dot" aria-hidden="true" />
      {children}
    </Tag>
  );
}
