// Button label whose letters roll up on hover/focus, each one replaced by its
// own copy riding a text-shadow below (styles/buttons.css, .roll). Screen
// readers get the plain text; the split letters are hidden from them.
export default function RollLabel({ text }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="roll" aria-hidden="true">
        {[...text].map((ch, i) => (
          <span key={i} className="roll__c" style={{ "--i": i }}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </>
  );
}
