// Authored icon set: 24px grid, round caps, currentColor, 1.75 stroke to sit
// beside 500-600 weight labels. Decorative by default (aria-hidden).

function Icon({ children, className = "size-4", strokeWidth = 1.75 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 12H5M11 6l-6 6 6 6" />
    </Icon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Icon>
  );
}

export function ArrowUpRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Icon>
  );
}

export function CopyIcon(props) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5.5 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v.5" />
    </Icon>
  );
}

export function MenuIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 8h16M4 16h16" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function PlusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

// Media glyphs are filled: at 16px a stroked triangle reads as an outline, not "play".
export function PlayIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.4-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z" />
    </svg>
  );
}

export function PauseIcon({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <rect x="6" y="5" width="4" height="14" rx="1.2" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" />
    </svg>
  );
}

export function VolumeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M11 5 6.5 9H4v6h2.5L11 19V5Z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </Icon>
  );
}

export function VolumeOffIcon(props) {
  return (
    <Icon {...props}>
      <path d="M11 5 6.5 9H4v6h2.5L11 19V5Z" />
      <path d="m16 10 4 4M20 10l-4 4" />
    </Icon>
  );
}

export function ExpandIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
    </Icon>
  );
}

export function ReplayIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 12a8 8 0 1 0 2.35-5.65L4 8.7" />
      <path d="M4 4v4.7h4.7" />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  );
}

// The arrow is its own group so CSS can drop it onto the tray (buttons.css).
export function DownloadIcon(props) {
  return (
    <Icon {...props}>
      <g className="dl-arrow">
        <path d="M12 4v10.5M7.5 10l4.5 4.5 4.5-4.5" />
      </g>
      <path d="M5 19.5h14" />
    </Icon>
  );
}

// The pupil is its own group so CSS can make it follow the pointer (buttons.css).
export function EyeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <g className="eye-pupil">
        <circle cx="12" cy="12" r="2.75" />
      </g>
    </Icon>
  );
}

export function MailIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </Icon>
  );
}

export function PhoneIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8.6 3.5H6a2 2 0 0 0-2 2.2C4.8 13.6 10.4 19.2 18.3 20a2 2 0 0 0 2.2-2v-2.6a1 1 0 0 0-.7-1l-3.3-1.1a1 1 0 0 0-1 .25l-1.6 1.6a12.5 12.5 0 0 1-5-5l1.6-1.6a1 1 0 0 0 .25-1L9.6 4.2a1 1 0 0 0-1-.7Z" />
    </Icon>
  );
}

export function LinkedInIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 10.5V17M7 7v.01M11 17v-6.5M11 13.75a3 3 0 0 1 6 0V17" />
    </Icon>
  );
}

export function GitHubIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </Icon>
  );
}

export function PaperPlaneIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20.5 3.5 3.5 10.2l6.6 2.7 2.7 6.6 7.7-16Z" />
      <path d="m10.1 12.9 4.6-4.6" />
    </Icon>
  );
}
