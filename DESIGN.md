---
name: Bernardo Nemirovsky Portfolio (Cinema Scroll)
description: A projection booth where scrolling is the play button and the whole page takes the colour of the current project's chapter.
colors:
  opening-ground: "#08090c"
  warm-white-ink: "#f4f2ee"
  marquee-amber: "#f5b83d"
  page-black: "#07080d"
  card-slate: "#11131c"
  fg-cool-white: "#f4f5f8"
  muted-steel: "#9aa3b5"
  hairline: "#2a2f3d"
  reveste-ground: "#331521"
  reveste-accent: "#d65c8f"
  pkz-ground: "#151a34"
  pkz-accent: "#6d80db"
  tabbit-ground: "#143223"
  tabbit-accent: "#2bab6b"
  orquestrador-ground: "#142031"
  orquestrador-accent: "#5188d4"
  companion-ground: "#211532"
  companion-accent: "#9a6cda"
  ap2-ground: "#321529"
  ap2-accent: "#d65cad"
  bombas-ground: "#332615"
  bombas-accent: "#c48731"
  b3-ground: "#14302b"
  b3-accent: "#2aa893"
  jarvis-ground: "#153134"
  jarvis-accent: "#2ba2ac"
  chat-amigos-ground: "#2c1431"
  chat-amigos-accent: "#c15ad6"
typography:
  display:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(3.5rem, 11vw, 9rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0"
  display-opening:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(4rem, 17vw, 13rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0"
  headline:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 9vw, 7rem)"
    fontWeight: 400
    lineHeight: 0.9
  title:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 0.95
  wordmark:
    fontFamily: "League Gothic, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    letterSpacing: "0.04em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  summary:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
rounded:
  pill: "999px"
  card: "14px"
  panel: "20px"
  marker: "2px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  letterbox: "7svh"
  hit: "44px"
components:
  chapter-open:
    backgroundColor: "var(--accent-chapter)"
    textColor: "var(--ground)"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "44px"
  chapter-tag:
    textColor: "var(--ink)"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  topbar-btn:
    textColor: "var(--ink)"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  credits-top:
    textColor: "var(--ink)"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "44px"
  index-panel:
    backgroundColor: "var(--ground)"
    textColor: "var(--ink)"
    rounded: "{rounded.panel}"
    padding: "20px clamp(16px, 3vw, 32px) 28px"
  timeline-marker:
    height: "44px"
    rounded: "{rounded.marker}"
---

# Design System: Bernardo Nemirovsky Portfolio (Cinema Scroll)

## Overview

**Creative North Star: "The Projection Booth"**

Scrolling is the play button. The page is one fixed 100svh scene inside a tall block; each project is a chapter, and as the visitor scrolls the whole page (ground, ink, accent, scrollbar-adjacent chrome, bars, buttons) takes the dominant hue of the current chapter while a 3D shelf of covers slides in an arc. It refuses the "hero plus rows of equal cards" pattern and the "black with one neon accent" pattern: here the colour changes per chapter and the accent is always a lightened relative of that chapter's ground.

The mood is dark, cinematic and quiet: letterbox bars, a faint static film grain, a video-style timeline at the base, tall League Gothic capitals against Inter body text with tabular numerals. Density is low; one chapter is on screen at a time and the type does the work.

**Key Characteristics:**
- One scroll value `f` (0 to chapters-1) drives colour, shelf, title, timeline and backdrops.
- Every chapter has its own ground/accent pair; ink is a shared warm white.
- League Gothic uppercase for titles, Inter for everything else.
- Pill-shaped controls, 44px minimum hit area, 3px focus ring.
- Flat surfaces; depth comes from the 3D shelf, scrim and letterbox, not from shadows.
- A static, stacked-chapter page replaces the stage for reduced motion, weak devices and no WebGL.

## Colors

Near-black grounds, each tinted toward one project's hue at roughly 12 to 16% lightness; a lightened accent of the same hue; warm white text.

### Primary
- **Marquee Amber** (#f5b83d): the opening and credits accent, the `--accent` token, links, selection and the default focus ring.

### Secondary (per-chapter accents, from `src/data/palette.json`)
- Reveste Rose (#d65c8f), PKZ Periwinkle (#6d80db), Tabbit Green (#2bab6b), Orquestrador Blue (#5188d4), Companion Violet (#9a6cda), AP2 Magenta (#d65cad), Bombas Ochre (#c48731), B3 Teal (#2aa893), Jarvis Cyan-Teal (#2ba2ac), Chat Amigos Orchid (#c15ad6). Each is used for the chapter button fill, meta line, counter, active timeline marker and hover/focus borders while its chapter is current.

### Neutral
- **Opening Ground** (#08090c): opening and credits ground (`--ground` default).
- **Warm White Ink** (#f4f2ee): `--ink` for every chapter; text on all grounds.
- **Page Black** (#07080d) / **Card Slate** (#11131c) / **Cool White** (#f4f5f8) / **Muted Steel** (#9aa3b5) / **Hairline** (#2a2f3d): the static `--bg`, `--card`, `--fg`, `--muted`, `--border` tokens for body, the scrollbar, the index panel border and project-detail surfaces.

### Chapter palette table (ground / accent; ink is #f4f2ee throughout)
| Chapter | Ground | Accent |
|---|---|---|
| opening | #08090c | #f5b83d |
| reveste | #331521 | #d65c8f |
| pkz | #151a34 | #6d80db |
| tabbit | #143223 | #2bab6b |
| orquestrador | #142031 | #5188d4 |
| companion | #211532 | #9a6cda |
| ap2 | #321529 | #d65cad |
| bombas | #332615 | #c48731 |
| b3 | #14302b | #2aa893 |
| jarvis | #153134 | #2ba2ac |
| chat-amigos | #2c1431 | #c15ad6 |
| credits | #08090c | #f5b83d |

### How colour is driven
`CinemaStage` maps `f` through `useTransform` over integer stops (chapter index i) onto the three palette arrays, writing `--ground`, `--ink`, `--accent-chapter` and `background-color` on the sticky scene. Between chapters the values interpolate continuously; at an integer `f` the chapter's exact palette shows. Everything inside the scene (topbar, timeline, scrim, bars, buttons) reads those variables. Unknown ids fall back to the opening palette (`paletteFor`). The palette lives in `palette.json`, generated by a script in `scripts/`; do not hand-edit it per surface.

### Named Rules
**The Chapter Hue Rule.** Colour belongs to the chapter, not the component. Components take `var(--ground)`, `var(--ink)`, `var(--accent-chapter)`; they never hard-code a project hue.
**The Dark Ground Rule.** Chapter grounds stay at about 12 to 16% lightness with warm white ink on top; the accent is the same hue lightened enough to read as text and as a filled button against the ground.

## Typography

**Display Font:** League Gothic 400 (fallback Arial Narrow, sans-serif)
**Body Font:** Inter 300/400/600/700 (fallback system-ui, sans-serif)

**Character:** Tall condensed poster capitals over a neutral humanist sans; the contrast reads as film titling set over a quiet credits crawl.

### Hierarchy
- **Opening title** (League Gothic 400, clamp(4rem, 17vw, 13rem), 0.9, uppercase): "BERNARDO NEMIROVSKY" only.
- **Chapter title** (400, clamp(3.5rem, 11vw, 9rem), 0.9, uppercase, text-wrap balance): each project name, unmasked word by word.
- **Credits heading** (400, clamp(3rem, 9vw, 7rem), 0.9, uppercase).
- **Index title** (400, clamp(2rem, 5vw, 3.5rem), 0.95, uppercase).
- **Wordmark** (400, 1.5rem, letter-spacing 0.04em, uppercase): topbar.
- **Summary** (Inter 400, clamp(1rem, 1.4vw, 1.25rem), 1.5, max 62ch).
- **Body** (Inter 400, 16px, 1.5).
- **Label / meta** (Inter 600, 0.875rem to 1rem, tabular-nums): timeline readout, category and status line, counters, tags (400, 0.875rem).

### Named Rules
**The Tabular Numerals Rule.** Anything that counts (chapter counter, years, "10 projetos") uses `font-variant-numeric: tabular-nums`.
**The Display Only For Titles Rule.** League Gothic is for titles and the wordmark; summaries, buttons, tags and meta stay in Inter.

## Layout

One fixed scene: `.cinema` is a tall block of `(chapters + 2) x 130svh`; `.cinema-sticky` pins at 100svh and holds all layers (canvas, scrim, letterbox bars, topbar, chapter text, credits, timeline, grain). Text sits bottom-left in a one-column block (max 1200px), padded `calc(7svh + 24px)` top and `calc(7svh + 88px)` bottom so it clears the bars and timeline. Horizontal margin is the fluid gutter, `clamp(16px, 4vw, 48px)`. The topbar floats fixed at `top: 7svh` (just under the top bar). Spacing inside blocks runs on a 4/8/16/24px rhythm; chapter-block gap 16px, tag gap 8px, meta gap 4px 20px. The index grid is `auto-fill, minmax(clamp(140px, 22vw, 200px), 1fr)` with a 16px gap. Credits are capped at 720px. Narrow screens: the 3D shelf tightens spacing and shrinks the focused cover, and on portrait it shifts up above the text.

## Elevation & Depth

Flat. Surfaces are tonal: a bottom-weighted scrim of the chapter ground (94% at the bottom fading to transparent at 66%), letterbox bars (`ground` mixed 35% with black), and a timeline gradient (ground 88% to transparent). The only shadow is the index dialog's soft lift (`0 30px 80px rgb(0 0 0 / 70%)`) over a `rgb(7 8 13 / 88%)` backdrop. Real depth is the 3D shelf: covers recede 1.6 units per step, rotate on Y and dim to 40% opacity when off focus.

### Named Rules
**The Scrim Rule.** Text over covers or backdrops always sits on the ground-coloured scrim; never raise text without it.

## Shapes

Pills (999px) for every button and tag; 2px rounded timeline markers; the index panel uses `calc(14px + 6px)` (20px). Letterbox bars are full-bleed 7svh rectangles. Covers are 2:3 planes in the shelf. Borders are 1px, `currentcolor` or `color-mix(ink 35 to 40%, transparent)`; filled controls use a 2px border in the accent.

## Components

### Stage
Sticky 100svh scene (`.cinema-sticky`) holding scrim, bars, text, timeline, grain and the canvas (`StageCanvas` over `ShelfScene`). The canvas layer is pointer-transparent; pointer parallax listens on the document (max tilt 0.06 rad; backdrop drifts 0.4 / 0.25 units).

### Shelf (3D)
Item i at `d = i - f`, `a = |d|`. x = sign(d) x (a <= 1 ? 3.2a : 3.2 + 1.9(a-1)); z = -1.6a; rotY = -0.35d; opacity = 1 - 0.6 x min(1, a); scale eases from 1 to 1.7 by smoothstep when `a < 0.5`. Camera z 8, FOV 40, DPR capped 1.5 (1.25 under 768px). Backdrops (16:9, tinted #8d8d96, z -7) crossfade: floor(f) underneath, ceil(f) on top at opacity `f - floor(f)`; only the active chapter and its two neighbours stay loaded. Covers fade out over the last chapter so the shelf leaves before the credits. Failed cover: flat #1c1d24 plane. Render loop stops when the tab is hidden.

### Chapter text
Bottom-aligned block: title, meta (category, status, accent, 600 weight), summary, up to four tag pills, and the pill button "details" (accent fill, ground text, 44px; hover inverts to transparent with accent text; focus ring 3px in ink). Title unmask per word: `enter = clamp01((f - i + 0.5)/0.4 - min(order, 3) x 0.15)`; clip-path `inset(0 0 (1-enter)*100% 0)` and a translate of `(1-enter)*60%`. Each word sits in an overflow-hidden line with 0.14em top padding so accents on capitals are not clipped. The whole block fades in over the last 0.3 chapters before centre and rises `12svh x clamp01(f - i)` while fading out across 0.5. Inactive chapters are `visibility: hidden`. The opening title is `aria-hidden` (the header carries the h1).

### Timeline bar
Fixed bottom, video-style: readout row (current title left, tabular counter in accent right) over a track of 44px-tall markers with a 4px visible bar at 45% opacity (80% hover, 100% accent when `aria-current="step"`), 2px inset between bars, a gap before group starts. Gradient backing keeps it legible. Clicking a marker jumps by scroll (`offsetTop + index/last x travel`, instant) and announces the new chapter in a polite live region.

### Index panel
Dialog over `rgb(7 8 13 / 88%)`: ground-coloured panel, 1px hairline border, sticky head with League Gothic title and a pill close button (44px) so close stays reachable on phones; grid of project cards.

### Topbar
Wordmark left (League Gothic, ellipsis), pill buttons right on `ground 70%` with 35% ink border; hover turns the border accent. Pointer events pass through except on the controls.

### Credits
Last chapter: League Gothic heading, about text at 86% ink, links in accent, and a ghost pill "back to top" (40% ink border, accent on hover) that returns to chapter 0 and moves focus to the first timeline marker.

### Letterbox bars and grain
Top and bottom bars, 7svh each, `ground` mixed 35% with black, z 5, decorative. Grain is a static SVG feTurbulence tile (160px, baseFrequency .9) at 7% opacity, `mix-blend-mode: overlay`, z 6, never animated.

### Static fallback
`useCinemaMode` returns `static` for reduced motion, 2 cores or fewer, 2 GB or less, or no WebGL. `StaticChapters` stack one `min-height: 100svh` section per chapter, each with the chapter ground, a 35%-opacity backdrop image and a ground gradient (25% to transparent) for AA contrast; no scroll-driven animation, text rendered statically. The global reduced-motion rule also cuts transitions and animations to 0.01ms.

## Do's and Don'ts

### Do:
- **Do** drive every colour in the scene from `--ground`, `--ink` and `--accent-chapter`.
- **Do** add a project by adding its palette entry (ground at 12 to 16% lightness, accent lightened from the same hue, ink #f4f2ee) via the palette script.
- **Do** keep controls pill-shaped, at least 44px tall, with a 3px focus ring (accent, or ink on accent fills).
- **Do** keep a single `f` as the source of truth for motion; derive new effects from it with `useTransform`.
- **Do** keep a non-animated, non-3D equivalent for every chapter.
- **Do** use tabular numerals for counts and write League Gothic in uppercase.

### Don't:
- **Don't** return to rows of equal cards or a "black with one neon accent" page.
- **Don't** hard-code a project hue inside a component.
- **Don't** set body copy or buttons in League Gothic.
- **Don't** put text over covers or backdrops without the scrim.
- **Don't** animate the grain or add shadows for depth; the 3D shelf and tonal layers carry depth.
- **Don't** use Netflix marks or branding.
- **Don't** let motion decorate: it must reveal structure (chapters, projects).
