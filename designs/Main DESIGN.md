---
name: Aero Blue Telephony
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#404750'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#707881'
  outline-variant: '#c0c7d1'
  surface-tint: '#00639b'
  primary: '#005282'
  on-primary: '#ffffff'
  primary-container: '#016ba7'
  on-primary-container: '#d3e7ff'
  inverse-primary: '#97cbff'
  secondary: '#5e5f5c'
  on-secondary: '#ffffff'
  secondary-container: '#e0e0dc'
  on-secondary-container: '#626360'
  tertiary: '#11527c'
  on-tertiary: '#ffffff'
  tertiary-container: '#326a96'
  on-tertiary-container: '#d1e7ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cee5ff'
  primary-fixed-dim: '#97cbff'
  on-primary-fixed: '#001d33'
  on-primary-fixed-variant: '#004a76'
  secondary-fixed: '#e3e2df'
  secondary-fixed-dim: '#c7c7c3'
  on-secondary-fixed: '#1b1c1a'
  on-secondary-fixed-variant: '#464744'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#97ccfd'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#014a74'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
  sky-blue: '#016BA7'
  cloud-cream: '#F8F7F3'
  ink-charcoal: '#1C1C1E'
  telecom-pure: '#FFFFFF'
  glass-surface: rgba(255, 255, 255, 0.16)
  glass-border: rgba(255, 255, 255, 0.35)
  banner-shadow: rgba(28, 28, 30, 0.12)
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '600'
    lineHeight: 76px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 54px
    letterSpacing: -0.035em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  eyebrow:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

This design system blends retro mid-century telecommunications optimism with high-precision modern software engineering. It is targeted at founders, small-to-medium businesses, and modern operators who want an AI-native phone presence without feeling sterile, corporate, or overly algorithmic.

The visual style is **Tactile Modernist / Neo-Grotesque**:
- Rich, saturated sky canvas tones that evoke open airwaves and long-range connectivity.
- Halftone stipple textures and mechanical telecom engravings set against ultra-crisp digital interface layers.
- Playful kinetic metaphors (propeller banners, signal towers, horizon birds) grounded by clean, mathematical layouts.
- Warm paper-white pill controls providing tactile physical presence over vibrant atmospheric fields.

## Colors

The palette revolves around open-air transmission hues balanced with editorial paper tones:

- **Primary (`#016BA7`)**: The dominant brand signature representing open sky, crystal-clear cellular range, and direct utility. Used as dominant hero backgrounds, key active highlights, and brand identity marks.
- **Secondary (`#F8F7F3`)**: A soft, tactile newsprint cream. Serves as the primary surface color for high-contrast primary call-to-action buttons, cards, and modal dialogs.
- **Tertiary (`#024B75`)**: Deep stratospheric cobalt, used for contextual depth, hover states on primary actions, and fine linework.
- **Neutral (`#1C1C1E`)**: Deep carbon ink used for typography resting on cream surfaces and critical graphical accents (silhouettes, antenna line art).

When overlays or navigation elements rest over the vibrant blue surface, use semi-transparent white frosted glass treatments with subtle border illumination to retain ambient light while guaranteeing text contrast.

## Typography

The type system uses **Geist** throughout all roles to convey industrial clarity and geometric precision. Tight negative tracking across large display sizes creates an urgent, cohesive editorial impact reminiscent of vintage telecommunication mastheads:

- **Display & Headline Levels**: Defined by tight negative tracking (`-0.03em` to `-0.04em`) and compact line-heights. Headlines over saturated surfaces must always render in crisp `#FFFFFF` with anti-aliasing forced.
- **Eyebrow & Subheadings**: Rendered in mid-weight sans (`fontWeight: 600`), typically placed directly over hero titles as directional anchors.
- **Labels & UI Text**: Prioritize legibility with slightly relaxed tracking. Numeric pricing or announcement markers use medium-to-bold weights to cut through background halftones cleanly.

## Layout & Spacing

The layout model is a structured, balanced 12-column fluid grid contained within large, edge-padded structural canvases:

- **Canvas Enclosures**: Large hero zones and primary content blocks sit inside framed cards with generous internal padding and wide outer margins (`2rem` desktop, `1rem` mobile).
- **Asymmetric Tension**: Hero sections place bold, typography-driven content in the left 7 columns, leaving the right 5 columns open for illustrative technical artifacts (e.g., lattice cellular towers, halftone clouds, low-altitude aircraft).
- **Responsive Adaptations**:
  - **Desktop (1024px+)**: 12 columns, 24px gutters, dynamic horizontal breathing room allowing illustration assets to anchor to bottom-right bounds.
  - **Tablet (768px - 1023px)**: 8 columns, 20px gutters, content reflows into a single balanced column with technical illustrations shifted to the lower canvas.
  - **Mobile (< 768px)**: 4 columns, 16px gutters, text stacks centrally or flush-left with simplified single-layer backgrounds to preserve legibility.

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows; instead, it uses physical stratification and atmospheric translucency:

- **Level 0 (Sky Canvas)**: Pure saturated cobalt surface (`#016BA7`) layered with stippled newsprint halftone textures and line-etched telecom motifs.
- **Level 1 (Glass Overlays)**: Translucent navigation bars, status capsules, and secondary interactive pills using `rgba(255, 255, 255, 0.16)` backdrop blur (`12px`), bordered with crisp hairline outlines (`1px solid rgba(255, 255, 255, 0.35)`).
- **Level 2 (Solid Tactile Controls)**: Opaque cream pills (`#F8F7F3`) with dark ink text. Elevated with soft, ultra-subtle ambient under-glow (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08)`), imparting a physical, pressable quality.
- **Level 3 (Floating Utility & Badges)**: Banners, flight ribbons, and contextual floating badges that cast shallow directional micro-shadows (`box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14)`).

## Shapes

The design system embraces high roundedness with full pill capsules (`9999px`) for active interactive controls and generous organic curvature for layout frames:

- **Primary Actions & Badges**: Fully rounded pills (`border-radius: 9999px`) for all primary buttons, ghost navigation capsules, and flight-tag announcements.
- **Main Hero Frames**: Outer atmospheric canvas containers feature oversized corner radii (`2rem` to `2.5rem`), softening the transition between the browser canvas and the blue sky field.
- **Cards & Data Modules**: Defined with rounded corners (`1.5rem` / `24px`), maintaining continuity with the softer tactile pill motifs.

## Components

### Buttons
- **Primary Action Pill**: Surface in `#F8F7F3` with `#1C1C1E` bold label text. Pill-shaped (`border-radius: 9999px`), internal padding `0.875rem 1.75rem`. Accompanied by inline downward arrows or directional icons for intent. On hover, slightly shifts down with subtle contrast reinforcement.
- **Secondary / Glass Capsule**: Translucent white fill (`rgba(255, 255, 255, 0.14)`), `1px solid rgba(255, 255, 255, 0.35)`, white text (`#FFFFFF`). Backing filter with `backdrop-filter: blur(12px)`.

### Chips & Announcement Ribbons
- **Announcement Banner**: Floating pill or ribbon-tailed banner styling. Semi-opaque white background, dark carbon text, paired with dynamic live-status indicator dots (flashing pulse in `#1C1C1E` or status green).
- **Feature Badges**: Petite capsules with `0.25rem 0.75rem` padding, containing small utility text (`12px`, semibold) for metrics such as pricing and round milestones.

### Cards
- **Content Blocks**: Crisp white containers or deep cobalt containers with 24px corner radii. When set on white canvases, cards feature 1px soft gray outlines (`#E5E7EB`). When set over sky-blue surfaces, cards use semi-translucent frosted glass panels.

### Navigation Bar
- **Frameless Header**: Floats directly across the upper sky bounds. Navigation items render as bare white typography with clean hover underlines, culminating in an encapsulated glass or solid CTA pill on the right boundary.

### Inputs & Fields
- **High-Contrast Input Fields**: Inset white or cream pill-shaped containers with interior padding `0.875rem 1.25rem`. Text rendered in `#1C1C1E`. Focus state presents a defined 2px outline in `#016BA7` or deep cobalt glow.

### Checkboxes & Radio Controls
- Circular checks and pill radios using `#016BA7` active fill with crisp white check marks, surrounded by a 1.5px border in `#D1D5DB`.