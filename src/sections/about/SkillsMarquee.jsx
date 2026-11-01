// Two infinite rows moving in opposite directions. Each row renders its items
// twice and slides by exactly half its width (see styles/about.css), so the
// loop is seamless. The duplicate set is hidden from assistive tech.
function Row({ items, reverse }) {
  return (
    <div className="marquee" data-reverse={reverse || undefined}>
      <ul className="marquee__track">
        {[0, 1].map((copy) =>
          items.map((item) => (
            <li
              key={`${copy}-${item.label}`}
              aria-hidden={copy === 1 || undefined}
              className="inline-flex shrink-0 items-center gap-2.5 glass rounded-full px-5 py-2.5 text-[0.9375rem] font-medium tracking-[-0.01em] text-ink sm:px-6 sm:py-3 sm:text-base"
            >
              {item.src && <img src={item.src} alt="" className="size-5 object-contain" />}
              {item.label}
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

export default function SkillsMarquee({ rows }) {
  return (
    <div id="stack" className="flex flex-col gap-3 sm:gap-4">
      {rows.map((items, i) => (
        <Row key={i} items={items} reverse={i % 2 === 1} />
      ))}
    </div>
  );
}
