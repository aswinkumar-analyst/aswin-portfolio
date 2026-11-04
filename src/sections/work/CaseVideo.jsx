import { useEffect, useRef, useState } from "react";
import {
  ExpandIcon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  VolumeIcon,
  VolumeOffIcon,
} from "../../components/ui/Icons";
import CoverMedia from "./CoverMedia";

const IDLE_MS = 2400; // controls fade after this long without pointer movement

const clock = (s) => {
  const t = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

// Autoplay only when it costs the visitor nothing: no reduced motion, no Data Saver.
const canPreview = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !navigator.connection?.saveData;

const controlButton =
  "grid size-10 flex-none place-items-center rounded-full text-on-sky transition-[background-color,scale] duration-150 ease-ui outline-cloud hover:bg-white/15 active:scale-95";

/**
 * One cut, two jobs. "Intro": a muted loop that plays as soon as the dialog has
 * finished opening, like an animated banner. "Watch with sound" restarts it from
 * 0:00 as the walkthrough, with sound and custom controls. Phones held upright
 * get the 4:5 file, everything else the 16:9 one; only that file downloads.
 *
 * Layers, bottom to top: the card's cover (what the dialog grew out of, so the
 * hand-off from ProjectModal's ghost is seamless), the 4:5 poster on phones,
 * the video (shown once it has a frame), then the overlays.
 */
export default function CaseVideo({ project, portrait, active }) {
  const { video, title } = project;
  const ref = useRef(null);
  const seekRef = useRef(null);
  const idleTimer = useRef(0);
  const [preview] = useState(canPreview);
  const [mode, setMode] = useState("intro"); // intro | full
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [idle, setIdle] = useState(false);

  // The intro waits for the open animation, and everything pauses while the
  // dialog closes or swaps to another case.
  useEffect(() => {
    const v = ref.current;
    if (!active) {
      v.pause();
      return;
    }
    if (mode === "intro" && preview) {
      v.muted = true;
      v.loop = true;
      v.play().catch(() => {}); // Low Power Mode etc.: the play button stays up
    }
  }, [active, mode, preview]);

  // Scrubber fill follows playback every frame; React state only drives the clock.
  useEffect(() => {
    if (!playing) return;
    const v = ref.current;
    let raf = 0;
    const tick = () => {
      const input = seekRef.current; // only rendered once the walkthrough starts
      if (input && v.duration) {
        input.value = String(v.currentTime);
        input.style.setProperty("--p", `${(v.currentTime / v.duration) * 100}%`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const wake = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  };

  const watch = () => {
    const v = ref.current;
    v.loop = false;
    v.muted = false;
    v.currentTime = 0;
    setMode("full");
    setEnded(false);
    wake();
    v.play().catch(() => {
      v.muted = true; // sound blocked: play silently rather than not at all
      v.play().catch(() => {});
    });
  };

  const toggle = () => {
    const v = ref.current;
    wake();
    if (ended) {
      v.currentTime = 0;
      setEnded(false);
    }
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seek = (e) => {
    const v = ref.current;
    v.currentTime = Number(e.target.value);
    e.target.style.setProperty("--p", `${(v.currentTime / (v.duration || 1)) * 100}%`);
    setTime(v.currentTime);
    setEnded(false);
    wake();
  };

  const fullscreen = () => {
    const v = ref.current;
    const wrap = v.parentElement;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.(); // iOS Safari: only the video element can go fullscreen
  };

  const full = mode === "full";
  const controlsHidden = full && playing && idle;
  const src = portrait ? video.portrait : video.landscape;
  const poster = portrait ? video.portraitPoster : null;

  return (
    <div
      className="group/video relative size-full overflow-hidden bg-ink-deep"
      onPointerMove={full ? wake : undefined}
      data-idle={controlsHidden || undefined}
    >
      <CoverMedia project={project} sizes="(min-width: 768px) 80rem, 100vw" loading="eager" fetchPriority="high" />
      {poster && (
        <picture>
          <source type="image/avif" srcSet={poster.avif} />
          <img
            src={poster.fallback}
            alt=""
            width={poster.width}
            height={poster.height}
            decoding="async"
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ease-ui ${active ? "opacity-100" : "opacity-0"}`}
          />
        </picture>
      )}

      <video
        ref={ref}
        src={src}
        playsInline
        muted
        preload={preview ? "auto" : "metadata"}
        aria-label={`${title}: walkthrough film, ${video.duration}`}
        onClick={full ? toggle : undefined}
        onPlaying={(e) => {
          setPlaying(true);
          setHasFrame(true);
          setWaiting(false);
          setDuration(e.currentTarget.duration);
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
          setIdle(false);
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        onError={() => setFailed(true)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ease-ui ${
          hasFrame ? "opacity-100" : "opacity-0"
        } ${full ? "cursor-pointer" : ""}`}
      />

      {waiting && active && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-10 -translate-1/2 animate-spin rounded-full border-2 border-white/25 border-t-white"
        />
      )}

      {failed ? (
        <p className="absolute bottom-4 left-4 rounded-full bg-ink-deep/70 px-3 py-1.5 text-xs text-on-sky-muted backdrop-blur-md">
          This film can&rsquo;t play in your browser.
        </p>
      ) : !full ? (
        // Intro: one clear way in. A pill while the muted preview loops, a big
        // play button when nothing is playing (reduced motion, Data Saver, blocked).
        playing ? (
          <button
            type="button"
            onClick={watch}
            className="sheen absolute bottom-3 left-3 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-cloud py-2 pr-4 pl-2 text-sm font-semibold text-ink shadow-[0_8px_24px_-8px_rgb(8_31_54/0.5)] transition-[scale] duration-150 ease-ui outline-cloud active:scale-[0.97] sm:bottom-5 sm:left-5"
          >
            <span className="grid size-7 place-items-center rounded-full bg-ink text-cloud">
              <PlayIcon className="size-3" />
            </span>
            Watch with sound
            <span className="font-normal text-ink/55 tabular-nums">{video.duration}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={watch}
            aria-label={`Play the ${title} film, ${video.duration}`}
            className="absolute top-1/2 left-1/2 grid size-18 -translate-1/2 place-items-center rounded-full border border-glass-border bg-ink-deep/40 text-on-sky backdrop-blur-md transition-[scale,background-color] duration-200 ease-ui outline-cloud hover:bg-sky active:scale-95"
          >
            <PlayIcon className="ml-1 size-6" />
          </button>
        )
      ) : (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/40 to-transparent px-2 pt-12 pb-2 transition-opacity duration-300 ease-ui group-has-[:focus-visible]/video:opacity-100 sm:px-4 sm:pb-3 ${
            controlsHidden ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={ended ? "Replay" : playing ? "Pause" : "Play"}
              className={controlButton}
            >
              {ended ? <ReplayIcon className="size-5" /> : playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
            </button>
            <span className="w-[5.5rem] flex-none text-center font-mono text-xs text-on-sky-muted tabular-nums">
              {clock(time)} / {clock(duration)}
            </span>
            <input
              ref={seekRef}
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              defaultValue="0"
              onInput={seek}
              aria-label="Seek"
              aria-valuetext={`${clock(time)} of ${clock(duration)}`}
              className="case-seek min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={() => {
                ref.current.muted = !ref.current.muted;
                wake();
              }}
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
              className={controlButton}
            >
              {muted ? <VolumeOffIcon className="size-5" /> : <VolumeIcon className="size-5" />}
            </button>
            <button type="button" onClick={fullscreen} aria-label="Full screen" className={controlButton}>
              <ExpandIcon className="size-[1.125rem]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
