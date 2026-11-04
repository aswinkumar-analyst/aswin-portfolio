// Headline words, each in its own clipped line mask so it can rise out of it.
// Pass the full text as the heading's aria-label: the split words are hidden.
export default function MaskedWords({ text, mask = "-mb-[0.12em] pb-[0.12em]" }) {
  return text.split(" ").map((word, i) => (
    <span key={i} aria-hidden="true">
      <span className={`${mask} inline-block overflow-hidden align-bottom`}>
        <span data-word className="inline-block">
          {word}
        </span>
      </span>{" "}
    </span>
  ));
}
