import { useEffect, useRef, useState } from "react";
import { resume } from "../../config/site";
import { useMagnetic } from "../../hooks/useMagnetic";
import { CheckIcon, DownloadIcon } from "./Icons";
import RollLabel from "./RollLabel";

// Hero résumé download: the clear sky-glass half of the liquid-glass pair
// (styles/buttons.css). A plain link with `download`, so every device uses its
// native save flow, and long-press or right-click still offers "open in new
// tab". After a click the icon turns into a check for a moment and screen
// readers hear that the download started.
// `variant` picks the capsule: "sky" over the hero, "ink" on cream surfaces.
export default function ResumeButton({ className = "", variant = "sky" }) {
  const ref = useRef(null);
  useMagnetic(ref);
  const [done, setDone] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = () => {
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 2000);
  };

  return (
    <>
      <a
        ref={ref}
        href={resume.href}
        download={resume.fileName}
        onClick={onClick}
        data-done={done || undefined}
        className={`pill pill--${variant} fly-host ${className}`}
      >
        <span className="pill__cloud" aria-hidden="true" />
        <span className="pill__glint" aria-hidden="true" />
        <span data-magnet className="pill__icon" aria-hidden="true">
          <DownloadIcon className="resume__dl" strokeWidth={2.6} />
          <CheckIcon className="resume__ok" strokeWidth={2.8} />
        </span>
        <span data-magnet className="pill__label">
          <span className="sr-only">Download </span>
          <RollLabel text={resume.label} />
        </span>
      </a>
      <span className="sr-only" aria-live="polite">
        {done ? `${resume.label} download started` : ""}
      </span>
    </>
  );
}
