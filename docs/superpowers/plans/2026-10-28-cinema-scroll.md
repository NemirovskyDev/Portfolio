# Cinema Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Follow TDD: write the test, watch it fail, implement, watch it pass.

**Goal:** Replace the profile-gate and rows home with a scroll-driven "Cinema Scroll": one fixed 3D scene of covers, one chapter per project, page color following the active chapter, a timeline bar and an index panel.

**Architecture:** One `progress` MotionValue `f` (0 to count-1) comes from the scroll of a tall stage. The 3D scene, the chapter text, the page color and the timeline all read `f`. A `cinema` or `static` mode (reduced motion, no WebGL, weak device) picks between the animated stage and stacked static chapters, both built from the same `Chapter[]` and palette.

**Tech Stack:** React 19, TypeScript, motion 14 (`useScroll`, `useTransform`), React Three Fiber + three, Lenis, vitest + Testing Library, Pillow (palette script only), `@fontsource/league-gothic` (new).

**Spec:** `docs/superpowers/specs/2026-10-28-cinema-scroll-design.md` (direction contract also in `.impeccable/surfaces/src-pages-home-tsx.md`). Product truth: `PRODUCT.md`.

## Global Constraints
- Only new dependency: `@fontsource/league-gothic` (approved 2026-10-28). Nothing else is installed.
- Animate only `transform`, `opacity` and the page color CSS variable; no layout properties, no `filter: blur` on the HTML layer.
- Contrast: text and accent on each chapter ground at least 4.5:1 (test-enforced).
- Every effect off with `prefers-reduced-motion` (scene, color transition, text motion, Lenis); the static mode shows all content.
- Canvas: one only, `dpr` up to 1.5 (1.25 on screens under 768 px), textures for covers (800×1200) always, backdrops (1600×900) only for the active chapter and its neighbours, frame loop paused when the tab is hidden.
- Use `100svh`, never `100vh`, for the stage and chapters (mobile address bar).
- No Netflix name, logo or exact red anywhere; no label above a heading; no emoji or glyphs as icons.
- Keep: `projects.json` and its validation, `ProjectModal`, `ProjectCard`, `useHashProject`, `useReducedMotion`, `useSmoothScroll`, `hasWebGL`, `CanvasBoundary`, `LangToggle`, PT/EN, deep links `#/p/<id>`.
- Subagents never run `git add/commit/push`. Nothing is committed or pushed until Bernardo asks.
- File ownership: each lead edits only the files listed in its tasks.

## Review Focus
1. Jumping from the timeline or index to a far chapter (and very fast scrolling): the active chapter must follow `f` without getting stuck. Test in Task 3 (`activeIndex`) and Task 8.
2. Inactive chapters must not be reachable by keyboard or screen reader (hidden buttons). Test in Task 6.
3. A cover or backdrop image that fails to load: the scene and the static chapters show a flat chapter-colored shape, never a broken image. Tests in Tasks 4 and 7.
4. A project whose category is not in the known order, or a missing palette entry: it goes last, with the opening palette as fallback. Tests in Tasks 1 and 2.
5. Opening `#/p/<id>` directly, or the modal while the stage is scrolled: no scroll jump, Lenis paused, closing returns to the same chapter. Test in Task 10.

---

### Task 0: Font and base styles (orchestrator, before the leads start)
**Files:** Modify `package.json`, `package-lock.json`, `src/styles/global.css`, `src/styles/tokens.css`
**Interfaces:** Produces CSS tokens `--display` (League Gothic stack), plus `--ground`, `--ink`, `--accent-chapter` defaults set on `:root` and overridden by the stage.
- [ ] `npm i @fontsource/league-gothic`; import its 400 weight in `global.css`; add `--display: 'League Gothic', 'Arial Narrow', sans-serif`, `--ground: #07080d`, `--ink: #f4f5f8`, `--accent-chapter: #f5b83d` to `tokens.css`; keep existing tokens (the modal uses them).
- [ ] Verify: `npm run build` passes; the `contrast.test.ts` still passes.

### Task 1: Palette (Lead A)
**Files:** Create `scripts/extract-palette.py`, `src/data/palette.json`, `src/lib/palette.ts`, `src/lib/palette.test.ts`
**Interfaces:** Produces `type ChapterPalette = { ground: string; accent: string; ink: string }`; `paletteFor(id: string): ChapterPalette` (falls back to `opening`); `palette.json` is `Record<string, ChapterPalette>` with one key per project id plus `opening` and `credits`.
- [ ] Test `palette.test.ts`: every project id in `projects.json` plus `opening` and `credits` has an entry; for each entry `contrast(ink, ground) >= 4.5` and `contrast(accent, ground) >= 4.5`; `ground` luminance is between 0.005 and 0.06 (dark); `paletteFor('nao-existe')` equals the `opening` palette.
- [ ] Run it, see it fail.
- [ ] Implement `scripts/extract-palette.py`: for each project, take `public/projetos/<id>/backdrop.webp`, shrink to 64 px, weight pixels by saturation × value, take the dominant hue; `ground` = that hue at HSL lightness 0.12 to 0.16 (saturation capped at 0.55); `ink` = `#f4f2ee`; `accent` = same hue, lightness raised until contrast against `ground` is at least 4.5. `opening` and `credits` use a near-black neutral ground (`#08090c`) and the amber accent `#f5b83d`. Run it, commit nothing, save `palette.json`; implement `palette.ts`.
- [ ] `npx vitest run src/lib/palette.test.ts` passes.

### Task 2: Chapters (Lead A)
**Files:** Create `src/lib/chapters.ts`, `src/lib/chapters.test.ts`
**Interfaces:** Produces:
```ts
export type Chapter =
  | { id: 'opening'; kind: 'opening' }
  | { id: string; kind: 'project'; project: Project }
  | { id: 'credits'; kind: 'credits' }
export const CATEGORY_ORDER: readonly string[] // ['IA e Agentes','Sites','Hackathons','Hardware','Universidade','Ferramentas']
export function buildChapters(projects: Project[]): Chapter[]
export function activeIndex(f: number, count: number): number // clamp(Math.round(f), 0, count - 1)
```
- [ ] Tests: `buildChapters` returns `[opening, ...projects, credits]` with projects ordered by `CATEGORY_ORDER` then by their order in the data; a project with an unknown category goes after the known ones, in data order; 10 seed projects give 12 chapters, `reveste` and `pkz` before `tabbit`; `activeIndex(-3, 12) === 0`, `activeIndex(6.4, 12) === 6`, `activeIndex(6.5, 12) === 7`, `activeIndex(99, 12) === 11`, `activeIndex(NaN, 12) === 0`.
- [ ] Run, see them fail; implement; run, see them pass.

### Task 3: Stage progress (Lead A)
**Files:** Create `src/lib/useStageProgress.ts`, `src/lib/useStageProgress.test.ts`
**Interfaces:** Produces `useStageProgress(ref: RefObject<HTMLElement | null>, count: number): MotionValue<number>`: the stage's scroll progress (offset `['start start', 'end end']`) mapped to `[0, count - 1]`.
- [ ] Test (mock `motion/react` `useScroll` to return a controllable MotionValue): progress 0 gives 0, 1 gives `count - 1`, 0.5 gives `(count - 1) / 2`; `count = 1` always gives 0 (no division by zero).
- [ ] Run, see it fail; implement with `useScroll` and `useTransform`; run, see it pass.

### Task 4: Shelf layout, mode and canvas (Lead B)
**Files:** Create `src/lib/shelfLayout.ts`, `src/lib/shelfLayout.test.ts`, `src/lib/useCinemaMode.ts`, `src/lib/useCinemaMode.test.ts`, `src/scenes/ShelfScene.tsx`, `src/components/Cinema/StageCanvas.tsx`, `src/components/Cinema/StageCanvas.css`, `src/components/Cinema/StageCanvas.test.tsx`
**Interfaces:** Produces:
```ts
export type ShelfItem = { x: number; z: number; rotY: number; scale: number; opacity: number }
export function shelfLayout(count: number, f: number): ShelfItem[]   // pure
export function useCinemaMode(): 'cinema' | 'static'
export function StageCanvas(props: { covers: string[]; backdrops: string[]; progress: MotionValue<number>; fallback: ReactNode }): JSX.Element
```
- [ ] `shelfLayout` tests: returns `count` finite items; with `d = i - f`: `x = d * 3.2`, `z = -|d| * 1.6`, `rotY = -d * 0.35`; at `d = 0` scale is 1.7 and opacity 1; for `|d| >= 0.5` scale is 1; opacity is `1 - min(1, |d|) * 0.6`; `count = 0` returns `[]`; `f` outside `[0, count-1]` stays finite.
- [ ] `useCinemaMode` tests: `static` with reduced motion; `static` when `hasWebGL()` is false; `static` when `navigator.hardwareConcurrency <= 2` or `deviceMemory <= 2`; otherwise `cinema`.
- [ ] `StageCanvas` tests (mock `hasWebGL` and the lazy `ShelfScene`, as in `OrbitBackdrop.test.tsx`): renders the scene when WebGL works; renders `fallback` when WebGL is missing, when motion is reduced, when the scene throws, and when `covers` is empty.
- [ ] Run all, see them fail; implement. `ShelfScene` default-exports a component with props `{ covers; backdrops; progress }`: planes with cover textures positioned by `shelfLayout(covers.length, progress.get())` read in `useFrame`; one large backdrop plane that mixes the active and neighbour backdrops by `f` with a small pointer parallax; failed textures show a flat plane; `frameloop` `never` when the tab is hidden; `dpr` per the global constraint; canvas is `aria-hidden`.
- [ ] Run, see them pass; `npm run build` shows three.js still in its own chunk.

### Task 5: Chapter text (Lead C)
**Files:** Create `src/components/Cinema/ChapterText.tsx`, `src/components/Cinema/ChapterText.css`, `src/components/Cinema/ChapterText.test.tsx`
**Interfaces:** Consumes `Chapter`, `useAppState().lang`, `MotionValue<number>`. Produces `ChapterText(props: { chapter: Chapter; index: number; progress: MotionValue<number>; active: boolean; count?: number; onOpen: (id: string) => void })`.
- [ ] Tests: a project chapter renders an `h2` with the title, the summary, the category label, the status, up to 4 stack tags and a "Ver detalhes" button that calls `onOpen(project.id)`; the opening chapter renders the only `h1` ("Bernardo Nemirovsky"), the support line `t('opening.line')` and the count `t('opening.count')` with the `count` prop (number of projects, optional prop used only by the opening); inactive chapters have `visibility: hidden` and their button is not focusable; with reduced motion no inline `transform` or `opacity` is set.
- [ ] Run, see them fail; implement. Titles use `--display`, uppercase, size `clamp(4rem, 14vw, 12rem)`, entering by lines with `clip-path` and `translateY` driven by `progress` and leaving upward; text colors come from `--ink` and `--accent-chapter`.
- [ ] Run, see them pass.

### Task 6: Timeline bar (Lead C)
**Files:** Create `src/components/Cinema/TimelineBar.tsx`, `src/components/Cinema/TimelineBar.css`, `src/components/Cinema/TimelineBar.test.tsx`
**Interfaces:** Produces `TimelineBar(props: { chapters: Chapter[]; activeIndex: number; onJump: (index: number) => void })`.
- [ ] Tests: a `nav` with an accessible name and one button per chapter; the active one has `aria-current="step"`; clicking or pressing Enter on a button calls `onJump(index)`; the current title and "03 / 12" style counter (tabular numerals) are shown; the buttons keep a 44 px hit area; categories are visually grouped (a separator class between groups).
- [ ] Run, see them fail; implement; run, see them pass.

### Task 7: Index panel and static chapters (Lead C)
**Files:** Create `src/components/Cinema/IndexPanel.tsx`, `IndexPanel.css`, `IndexPanel.test.tsx`, `src/components/Cinema/StaticChapters.tsx`, `StaticChapters.css`, `StaticChapters.test.tsx`
**Interfaces:** Produces `IndexPanel(props: { open: boolean; projects: Project[]; onClose: () => void; onOpenProject: (id: string) => void })` and `StaticChapters(props: { chapters: Chapter[]; onOpen: (id: string) => void })`.
- [ ] `IndexPanel` tests: closed renders nothing; open renders a `dialog` with one `ProjectCard` per project, moves focus inside, `Esc` and the close button call `onClose`, choosing a card calls `onOpenProject(id)` then closes.
- [ ] `StaticChapters` tests: every chapter's content is in the DOM and visible, with the chapter palette applied as CSS variables; no inline `transform`; a missing cover shows a flat chapter-colored block; the "Ver detalhes" buttons call `onOpen`.
- [ ] Run, see them fail; implement; run, see them pass.

### Task 8: Credits and page assembly (orchestrator, after the leads)
**Files:** Create `src/components/Cinema/Credits.tsx`, `Credits.css`, `Credits.test.tsx`; Rewrite `src/pages/Home.tsx` and `src/pages/Home.css`, `src/pages/Home.test.tsx`
**Interfaces:** Consumes everything above. `Credits(props: { onTop: () => void })` reuses `About` content (GitHub, LinkedIn) plus a "voltar ao início" button.
- [ ] Tests (`Home.test.tsx`): `cinema` mode renders the stage, the header, the timeline and the index button; `static` mode (reduced motion) renders every chapter; the page has one `h1`; the "Índice" button opens the panel; jumping from the timeline updates `aria-current`; `#/p/<id>` opens the modal; an unknown hash renders only the page; the language toggle switches texts.
- [ ] Implement `Home.tsx`: `chapters = buildChapters(projects)`; stage height `(chapters.length + 2) * 130svh`; `progress = useStageProgress(stageRef, chapters.length)`; background and `--ground/--ink/--accent-chapter` interpolated from `paletteFor` stops with `useTransform`; `activeIndex` kept in state from `progress.on('change')`; `onJump` scrolls to `stageTop + index/(count-1) * (stageHeight - viewport)` through Lenis when active, `window.scrollTo` otherwise; Lenis paused while the modal is open.
- [ ] Add the film look in `Home.css`: letterbox bars (top and bottom, `7svh` each, `var(--ground)` darkened) and a static film-grain overlay (`::after`, an SVG `feTurbulence` data URI at low opacity, `pointer-events: none`, removed with reduced motion). Header: wordmark, "Índice" button, language toggle.
- [ ] Run, see them pass.

### Task 9: Cleanup (orchestrator)
**Files:** Delete `src/components/ProfileGate/`, `src/components/MorphTransition/`, `src/components/RevealRows/`, `src/components/Row/`, `src/components/Hero/`, `src/scenes/OrbitScene.tsx`, `src/lib/morphLayout.ts(+test)`, `src/lib/profiles.ts(+test)`; Modify `src/App.tsx`, `src/App.test.tsx`, `src/state/AppState.tsx(+test)` (language only, no profile), `src/lib/i18n.ts` (remove `gate.*`, `profile.*`, `hero.*`; add `opening.line`, `opening.count`, `opening.scroll`, `timeline.label`, `index.open`, `index.title`, `credits.top`), `src/data/projects.ts` (drop `covers` if unused), `index.html` fallback text if needed.
- [ ] Remove each file only after `grep` shows no remaining importer; update tests that referenced removed code; `npx vitest run`, `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass.

### Task 10: Behavior in the browser and final checks (orchestrator)
- [ ] Run the dev server; inspect desktop (1280×800), the user's viewport and mobile (390×844): opening, three chapters, the color transition, timeline jump, index, modal from a chapter, `#/p/<id>` deep link, language switch, reduced motion and no-WebGL fallbacks. Fix what one batched look shows; a second look is the ceiling.
- [ ] Confirm Review Focus 5 (modal and scroll position) by test and by hand.
- [ ] Then the quality pipeline of CLAUDE.md (layers 2 to 11) and the Impeccable finish: `impeccable detect --json`, finish reviewer (fresh), documenter writing `DESIGN.md` and `.impeccable/design.json`.
