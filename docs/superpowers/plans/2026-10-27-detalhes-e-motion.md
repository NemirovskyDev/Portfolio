# Detalhes dos projetos e motion de scroll/3D — Implementation Plan

> **For agentic workers:** each workstream is owned by one subagent. Steps use checkbox (`- [ ]`) syntax. Follow TDD: write the test, watch it fail, implement, watch it pass.

**Goal:** Fill the new detail fields of the 8 projects (PT/EN) and add scroll-driven 3D motion to the home: hero depth, rows that enter in 3D with a stagger, and inertia scrolling (Lenis).

**Architecture:** Content lives only in `src/data/projects.json` (fields `funcionalidades`, `desafios`, already validated by `src/lib/validate.ts`). Motion uses `motion/react` (`useScroll`, `useTransform`, `whileInView`, variants) and `lenis`; every effect is gated by `useReducedMotion()` from `src/lib/useReducedMotion.ts`.

**Tech Stack:** React 19, TypeScript, motion 14, lenis (new, approved by Bernardo on 2026-10-27), vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-23-portfolio-design.md` + Bernardo's answers on 2026-10-27 (effects: hero depth, 3D row entrance, inertia scroll; intensity: medium; 3 Bombas: hardware facts only).

## Global Constraints
- Never invent facts. Content comes only from the facts listed in Task A.
- No team-member names, no client address, no finance/portfolio data in any text.
- Every effect is off with `prefers-reduced-motion: reduce` (no transform, no opacity hiding, no Lenis).
- Medium intensity: rotations ≤ 20°, translations ≤ 120 px, durations 0.5–0.9 s or springs (stiffness 80–120, damping 16–22).
- Animate only `transform` and `opacity` (no `filter: blur`, no layout properties).
- Keep existing tests green; update only tests whose subject is replaced (TunnelRows).
- Workstreams touch disjoint files: A only `src/data/projects.json` + `src/lib/content.test.ts`; B everything else listed in Tasks B1–B3.

## Review Focus
1. Modal open while Lenis is active: the page behind must not scroll; the modal must scroll with the wheel (`data-lenis-prevent`, `lenis.stop()`).
2. IntersectionObserver never fires (old browser, print, crawler): rows must not stay invisible.
3. Reduced motion turned on mid-session: Lenis destroyed, transforms gone.
4. Keyboard user tabbing into a card of a row not yet revealed: card must become visible (scroll into view triggers reveal).
5. Hero image fails to load: depth effect must not break the layout (existing fallback gradient stays).

---

### Task A: Detail texts for the 8 projects (subagent: content lead)

**Files:** Modify `src/data/projects.json`; Create `src/lib/content.test.ts`

- [ ] **Step 1: failing test `src/lib/content.test.ts`**: for every project in the validated seed: `funcionalidades` has 3–6 items; each item `pt` and `en` non-empty and ≤ 140 chars; `desafios.pt` and `desafios.en` present, ≤ 420 chars; `en !== pt` for every `desafios` and for at least half of the features (translated); the JSON text contains none of: `Giovanni`, `Alexia`, `João Pedro`, `Vitor`, `Bernardo Vaz`, `Armando Lombardi`, `Carteira`.
- [ ] **Step 2:** `npx vitest run src/lib/content.test.ts` → FAIL.
- [ ] **Step 3:** write the fields for each project from the facts in the brief (natural PT-BR, then faithful EN).
- [ ] **Step 4:** `npx vitest run` → all PASS; `npm run lint` clean.

### Task B1: Inertia scrolling with Lenis (subagent: motion lead)

**Files:** Create `src/lib/useSmoothScroll.ts`, `src/lib/useSmoothScroll.test.ts`; Modify `src/pages/Home.tsx`, `src/components/ProjectModal/ProjectModal.tsx` (only add `data-lenis-prevent` to the scrollable dialog), `src/main.tsx` or `src/styles/global.css` (Lenis CSS), `package.json` (`npm i lenis`).

**Interfaces:** Produces `useSmoothScroll({ enabled, paused }: { enabled: boolean; paused: boolean }): void`.

- [ ] Tests (mock `lenis`): creates one Lenis when `enabled`; none when `enabled` is false; calls `destroy()` on unmount and when `enabled` turns false; calls `stop()` when `paused` turns true and `start()` when it turns false.
- [ ] Home calls `useSmoothScroll({ enabled: !reduce, paused: Boolean(open) })`.
- [ ] RAF loop: use Lenis `autoRaf: true` (no manual loop).

### Task B2: Hero depth on scroll

**Files:** Modify `src/components/Hero/Hero.tsx`, `Hero.css`; Create `src/components/Hero/Hero.test.tsx`

- [ ] Behavior (medium): over the hero's own scroll range (`offset: ['start start', 'end start']`), background `y` 0→100 px, `scale` 1.04→1.16, `rotateX` 0→6° (perspective on the section); copy `y` 0→-60 px and `opacity` 1→0 reaching 0 at 80 % of the range.
- [ ] Tests: renders title and button (normal and reduced); with reduced motion the background and copy have no inline `transform` and no inline `opacity`; image error still shows the fallback (no `img.hero-bg`).

### Task B3: Rows that enter in 3D with stagger (replaces TunnelRows)

**Files:** Create `src/components/RevealRows/RevealRows.tsx`, `RevealRows.css`, `RevealRows.test.tsx`; Modify `src/components/Row/Row.tsx` (li → `motion.li` with card variants), `src/pages/Home.tsx`; Delete `src/components/TunnelRows/*` and move its tests out of `MorphTransition.test.tsx`.

**Interfaces:** Produces `RevealRows({ children }: { children: ReactNode })` and exported `rowVariants`, `cardVariants` (`hidden`/`shown`).

- [ ] Behavior (medium): container `perspective: 1200px`; each row `hidden = { opacity: 0, rotateX: 18, y: 60 }` → `shown = { opacity: 1, rotateX: 0, y: 0 }` via spring (stiffness ~100, damping ~20), `whileInView`, `viewport: { once: true, amount: 0.2 }`, children staggered 0.06 s; cards `hidden = { opacity: 0, y: 24, rotateY: -12 }` → `shown`.
- [ ] Rows start hidden only when `IntersectionObserver` exists; otherwise render shown.
- [ ] Tests: reduced motion → plain wrapper, no inline `opacity`/`transform` anywhere; without `IntersectionObserver` → no element with inline `opacity: 0`; normal → every row and card rendered; existing Home tests still pass.
- [ ] Verification for all of B: `npx vitest run`, `npm run lint`, `npx tsc --noEmit`, `npm run build` all green.
