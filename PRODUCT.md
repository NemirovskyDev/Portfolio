# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: a recruiter or hiring manager evaluating Bernardo Nemirovsky, a Computer Engineering student at IBMEC (Rio de Janeiro) aiming at AI roles. They have a few minutes, want to understand fast what he can build, and open one or two projects for depth. Secondary (not a design priority): classmates, professors and people from the field who explore more slowly. Visitors read Portuguese or English.

## Product Purpose
A personal portfolio that shows the projects Bernardo has already built, with what each one is for, the purpose, his role, the stack, features, challenges, screenshots and links. Success: a visitor leaves with a clear picture of his range and AI focus, and opens at least one project in depth.

## Positioning
Real range, built by one person: AI agents, web sites with clients and live deployments, a hackathon app, and physical hardware (Arduino with a 3D-printed enclosure). The site is itself a demonstration of his front-end, 3D and animation level. A neighbouring student portfolio rarely combines multi-agent AI work, shipped sites and hardware in one place.

## Operating Context
Static site on GitHub Pages (https://nemirovskydev.github.io/Portfolio/), built with Vite, React, TypeScript, React Three Fiber, motion and Lenis; deploys through GitHub Actions on every push to `main` after lint, tests and build. Content lives in `src/data/projects.json` (PT and EN per field); images are in `public/projetos/<id>/` (cover 2:3, backdrop 16:9, screenshots). Commits are authored as Bernardo; nothing is pushed or deployed without his confirmation.

## Capabilities and Constraints
- 10 projects: Reveste, PKZ Lab and One to One, Tabbit, Orquestrador multiagente, Companion App and Validator, Foi isso que eu pedi? (AP2), 3 Bombas, Consultas B3, Jarvis, Chat Amigos.
- Content, galleries and links of those 10 projects stay as they are; only the way they are presented may change.
- PT-BR and EN must keep working from any screen; every project keeps a direct link (`#/p/<id>`).
- Open product decision: the profile gate (Recrutador, Dev, Curioso) was not listed as a commitment; it may be kept, reshaped or dropped by the redesign.
- No backend, no contact form: contact is links only (GitHub and LinkedIn).
- Imagery is generated with Gemini (covers and backdrops) plus real screenshots; Chat Amigos has no live link because its Render service was turned off.

## Brand Commitments
Name: Bernardo Nemirovsky. Bilingual PT-BR and EN. Do not use Netflix's name, logo or exact red; the catalogue idea is a structural metaphor only. Imagery must not show identifiable real people.

## Evidence on Hand
Screenshots and galleries for Reveste, Tabbit, Companion, PKZ, Jarvis, Chat Amigos and 3 Bombas (including the wiring diagram); Gemini cover and backdrop for all 10 projects; GitHub and LinkedIn links; live sites for Reveste, Tabbit and PKZ. No testimonials, metrics or client logos exist; none may be invented.

## Product Principles
1. Show the work before talking about the person: a visitor should see real projects within the first screen.
2. Motion must carry meaning: scroll and 3D explain structure or reveal the projects, never decorate.
3. Every effect has a plain fallback: reduced motion, no WebGL and slow phones still get a complete, fast site.
4. One strong idea beats many effects: the site should be remembered for a single signature interaction.
5. Depth on demand: first view is quick for a recruiter in a hurry; details open on request.

## Accessibility & Inclusion
WCAG 2.1 AA contrast, full keyboard use with visible focus, `prefers-reduced-motion` honoured everywhere (including smooth scrolling), usable on phones, real HTML text for content and SEO.
