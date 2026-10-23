# Portfólio em estilo catálogo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site de portfólio em estilo catálogo (8 projetos, PT/EN, perfis, órbita 3D, morph e túnel) descrito no spec.

**Architecture:** SPA Vite + React + TS. Estado de tela `perfil → home`, modal por hash. Dados em `projects.json` validado ao carregar. Só `OrbitScene` usa Three.js, em chunk carregado sob demanda. Todo efeito tem fallback estático (sem WebGL, erro ou movimento reduzido).

**Tech Stack:** Vite, React, TypeScript, @react-three/fiber + drei + three, motion, vitest + Testing Library, ESLint.

**Spec:** `docs/superpowers/specs/2026-10-23-portfolio-design.md`

## Global Constraints
- Pasta do projeto: `F:\VS code\berna\AppData\Local\Programs\Projetos\Portfolio`, branch `feat/portfolio-catalogo` (repositório-raiz é `Projetos`, com mudanças de outros projetos: nunca usar `git add .`, sempre caminhos de `Portfolio/`).
- Idiomas PT-BR e EN. Tema escuro. Sem logotipo, nome ou vermelho exato da Netflix.
- Perfis: Recrutador (IA e Agentes primeiro, destaque `orquestrador`), Dev (Sites e Hardware primeiro, destaque `reveste`), Curioso (ordem livre, destaque `tabbit`).
- Status permitidos: `concluido` | `no-ar` | `em-andamento`.
- Modal abre por hash `#/p/<id>`. `localStorage` sempre em `try/catch`.
- Conteúdo público: sem endereço de cliente, nomes de times nem dados financeiros. Reveste mantém o aviso de pessoas geradas por IA.
- `prefers-reduced-motion`: sem canvas, morph nem túnel. Sem WebGL ou erro no canvas: grid estático.
- Não copiar código do Cosmos nem do Scroll Morph (licença desconhecida). Código do Tunnel só com crédito MIT.
- Confirmar com o Bernardo antes de instalar `motion` e antes de qualquer commit, push ou deploy.
- Contraste mínimo AA, teclado completo, foco visível, `lang` do documento acompanha o idioma.

## Review Focus
1. Hash `#/p/<id-inexistente>`: abre a home sem modal e sem erro.
2. `projects.json` com campo ausente ou EN vazio: erro claro no dev; em produção cai no texto PT e o site não quebra.
3. `localStorage` bloqueado ou lançando exceção: perfil e idioma funcionam só na sessão.
4. Sem WebGL, erro no canvas ou movimento reduzido: grid estático completo e navegável.
5. Título muito longo e imagem ausente: card não estoura o layout e mostra placeholder com o título.

---

### Task 0: Pré-requisitos (gate humano)
**Files:** Create: `design-system/Portfolio/MASTER.md`
**Interfaces:** Produces: tokens CSS de cor (`--bg`, `--fg`, `--muted`, `--accent`), fontes e raios usados em todas as tarefas.

- [ ] **Step 1:** Rodar a skill `ui-ux-pro-max` (design system) para o portfólio dark cinematográfico e mostrar ao Bernardo paleta, tipografia e acento. Salvar em `design-system/Portfolio/MASTER.md` se ele aprovar.
- [ ] **Step 2:** Pedir confirmação para instalar `motion` e as demais dependências. Sem confirmação, parar.
- [ ] **Step 3:** Verificar: o MASTER.md existe e define as quatro variáveis acima. Expected: arquivo presente com contraste do `--accent` sobre `--bg` ≥ 4.5:1.

### Task 1: Scaffold e ferramentas
**Files:** Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/test/setup.ts`; Test: `src/App.test.tsx`
**Interfaces:** Produces: scripts `npm run dev|build|lint|test`; `tokens.css` com as variáveis da Task 0.

- [ ] **Step 1:** Escrever `App.test.tsx` com `it('renders the profile gate heading', ...)` esperando `getByRole('heading', { name: /quem está assistindo/i })`.
- [ ] **Step 2:** `npm run test` — Expected: FAIL (App ainda não existe).
- [ ] **Step 3:** Criar o projeto (Vite react-ts) sem sobrescrever `docs/`, configurar vitest (jsdom, setup com jest-dom), ESLint e `tokens.css`; `App` renderiza um `<h1>` placeholder do gate.
- [ ] **Step 4:** `npm run test && npm run lint && npm run build` — Expected: tudo PASS.
- [ ] **Step 5:** Commit (somente com confirmação): `chore: scaffold portfolio app`, `git add Portfolio/<arquivos>`.

### Task 2: Camada de dados
**Files:** Create: `src/data/projects.json`, `src/lib/types.ts`, `src/lib/validate.ts`; Test: `src/lib/validate.test.ts`
**Interfaces:** Produces: `type Lang = 'pt'|'en'`; `type L10n = {pt:string; en:string}`; `type Status = 'concluido'|'no-ar'|'em-andamento'`; `type Project = {id:string; categoria:string; capa:string; fundo:string; titulo:L10n; resumo:L10n; proposito:L10n; papel:L10n; stack:string[]; status:Status; links?:{label:string; url:string}[]}`; `validateProjects(raw: unknown): Project[]` (lança `Error` com o `id` e o campo no dev; em produção descarta o item inválido e preenche EN vazio com o PT).

- [ ] **Step 1:** Testes: `accepts the 8 seed projects`; `throws naming id and field when titulo.pt is missing (dev)`; `falls back to pt when en is empty`; `rejects status 'x'`; `rejects non-http link urls`.
- [ ] **Step 2:** `npx vitest run src/lib/validate.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implementar `validateProjects` sem dependências novas. Preencher `projects.json` com os 8 projetos da tabela do spec (reveste, pkz, tabbit, orquestrador, companion, ap2, bombas, b3) em PT e EN, seguindo as regras de privacidade; só `reveste` e `tabbit` com `links`.
- [ ] **Step 4:** Rodar de novo — Expected: PASS.
- [ ] **Step 5:** Commit (com confirmação): `feat: project data and validation`.

### Task 3: i18n, perfis e armazenamento seguro
**Files:** Create: `src/lib/i18n.ts`, `src/lib/profiles.ts`, `src/lib/storage.ts`, `src/state/AppState.tsx`; Test: `src/lib/profiles.test.ts`, `src/lib/storage.test.ts`
**Interfaces:** Consumes: `Project`, `Lang`. Produces: `type Profile = 'recrutador'|'dev'|'curioso'`; `categoriesFor(profile: Profile, projects: Project[]): {categoria:string; items:Project[]}[]`; `featuredFor(profile: Profile, projects: Project[]): Project`; `t(key: string, lang: Lang): string`; `safeGet(key): string|null`, `safeSet(key, value): void` (nunca lançam); `useAppState(): {profile:Profile|null; lang:Lang; setProfile(p:Profile):void; setLang(l:Lang):void}`.

- [ ] **Step 1:** Testes: `recrutador puts "IA e Agentes" first and features orquestrador`; `dev features reveste with Sites then Hardware first`; `curioso features tabbit`; `safeGet returns null when localStorage throws`; `safeSet does not throw when localStorage throws`; `setLang updates document.documentElement.lang`.
- [ ] **Step 2:** Rodar — Expected: FAIL.
- [ ] **Step 3:** Implementar. `AppState` lê perfil e idioma via `safeGet` (idioma padrão `pt`) e grava via `safeSet`.
- [ ] **Step 4:** Rodar — Expected: PASS.
- [ ] **Step 5:** Commit (com confirmação): `feat: i18n, profiles and safe storage`.

### Task 4: Card, fileira e grid estático
**Files:** Create: `src/components/ProjectCard/ProjectCard.tsx`, `src/components/Row/Row.tsx`, `src/components/StaticGrid.tsx`, `src/lib/useReducedMotion.ts`; Test: `src/components/ProjectCard/ProjectCard.test.tsx`
**Interfaces:** Consumes: `Project`, `Lang`, `useAppState`. Produces: `<ProjectCard project onOpen(id:string) />` (botão acessível com nome = título, tilt só sem movimento reduzido); `<Row title projects onOpen />`; `<StaticGrid projects onOpen />`; `useReducedMotion(): boolean`.

- [ ] **Step 1:** Testes: `card is a button named after the title and calls onOpen with the id`; `card shows placeholder with the title when the image errors`; `very long title is clamped (has line-clamp class)`; `tilt handlers are not attached when reduced motion`.
- [ ] **Step 2:** Rodar — Expected: FAIL.
- [ ] **Step 3:** Implementar com `motion`; `onError` da imagem troca para placeholder; `alt` descritivo.
- [ ] **Step 4:** Rodar — Expected: PASS.
- [ ] **Step 5:** Commit (com confirmação): `feat: project card, row and static grid`.

### Task 5: Modal de projeto com hash
**Files:** Create: `src/components/ProjectModal/ProjectModal.tsx`, `src/lib/useHashProject.ts`; Test: `src/components/ProjectModal/ProjectModal.test.tsx`
**Interfaces:** Consumes: `Project`, `Lang`. Produces: `useHashProject(projects: Project[]): {project: Project|null; open(id:string):void; close():void}` (hash `#/p/<id>`, id inexistente → `null`); `<ProjectModal project onClose />` (`role="dialog"`, `aria-modal`, foco preso, `Esc` fecha, devolve o foco ao card).

- [ ] **Step 1:** Testes: `opens from #/p/reveste`; `unknown id renders nothing and no error`; `Esc closes and restores focus to the opener`; `Tab cycles inside the dialog`; `renders stack tags, status, papel and links`.
- [ ] **Step 2:** Rodar — Expected: FAIL.
- [ ] **Step 3:** Implementar; transição com `layoutId` (desligada em movimento reduzido).
- [ ] **Step 4:** Rodar — Expected: PASS.
- [ ] **Step 5:** Commit (com confirmação): `feat: project modal with hash routing`.

### Task 6: Home (hero, fileiras, sobre) e perfis estáticos
**Files:** Create: `src/components/Hero/Hero.tsx`, `src/components/About/About.tsx`, `src/components/LangToggle.tsx`, `src/components/ProfileGate/ProfileGate.tsx`, `src/pages/Home.tsx`; Modify: `src/App.tsx`; Test: `src/pages/Home.test.tsx`, `src/components/ProfileGate/ProfileGate.test.tsx`
**Interfaces:** Consumes: `categoriesFor`, `featuredFor`, `useHashProject`, `useAppState`. Produces: `<ProfileGate onChoose />` (três botões de perfil); `<Home />`.

- [ ] **Step 1:** Testes: `choosing "Dev" shows Reveste in the hero and Sites row first`; `LangToggle switches visible text to EN`; `Hero button "Ver detalhes" opens the featured project modal`; `About shows only GitHub and LinkedIn links, no email form`.
- [ ] **Step 2:** Rodar — Expected: FAIL.
- [ ] **Step 3:** Implementar. Links reais do GitHub e LinkedIn: perguntar ao Bernardo (não inventar).
- [ ] **Step 4:** Rodar — Expected: PASS.
- [ ] **Step 5:** Commit (com confirmação): `feat: home, hero and profile gate`.

### Task 7: Órbita 3D com fallback
**Files:** Create: `src/scenes/OrbitScene.tsx`, `src/components/ProfileGate/OrbitBackdrop.tsx`, `src/lib/hasWebGL.ts`, `src/components/CanvasBoundary.tsx`; Modify: `ProfileGate.tsx`; Test: `src/components/CanvasBoundary.test.tsx`, `src/lib/hasWebGL.test.ts`
**Interfaces:** Produces: `hasWebGL(): boolean`; `<CanvasBoundary fallback>` (error boundary); `<OrbitBackdrop covers: string[] />` (carrega `OrbitScene` via `React.lazy`; renderiza o `fallback` estático se `!hasWebGL()`, se movimento reduzido ou se o canvas lançar erro).

- [ ] **Step 1:** Testes: `renders fallback when hasWebGL is false`; `renders fallback when reduced motion`; `renders fallback when the scene throws`; `does not import three in the main chunk` (checar o manifesto do build).
- [ ] **Step 2:** Rodar — Expected: FAIL.
- [ ] **Step 3:** Implementar `OrbitScene` em R3F: planos com textura das capas em anel, reação leve ao mouse, `dpr` limitado a `[1, 1.5]`, `frameloop="never"` com a aba oculta. Recriar do zero.
- [ ] **Step 4:** `npm run test && npm run build` — Expected: PASS e `three` em chunk separado.
- [ ] **Step 5:** Commit (com confirmação): `feat: orbit backdrop with fallbacks`.

### Task 8: Morph e túnel
**Files:** Create: `src/components/MorphTransition/MorphTransition.tsx`, `src/lib/morphLayout.ts`, `src/components/TunnelRows/TunnelRows.tsx`; Modify: `App.tsx`, `Home.tsx`; Test: `src/lib/morphLayout.test.ts`, `src/components/MorphTransition/MorphTransition.test.tsx`
**Interfaces:** Produces: `morphLayout(n: number, t: number): {x:number; y:number; rotate:number}[]` (`t=0` espalhado, `0.5` círculo, `1` arco; função pura); `<MorphTransition covers onDone />` (~1,5 s; com movimento reduzido chama `onDone` imediatamente); `<TunnelRows>` (perspectiva por rolagem, sem efeito em movimento reduzido).

- [ ] **Step 1:** Testes: `morphLayout(8, 0.5) places all points at equal radius from the center`; `morphLayout(8, 1) spans an arc, not a full circle`; `morphLayout returns n entries for n in 1..12`; `MorphTransition calls onDone immediately when reduced motion`; `TunnelRows renders rows with no transform when reduced motion`.
- [ ] **Step 2:** Rodar — Expected: FAIL.
- [ ] **Step 3:** Implementar com `motion`. Túnel: `perspective` no contêiner e `translateZ` por progresso de rolagem, intensidade baixa. Se usar lógica do Tunnel Hero, citar autor e MIT em comentário.
- [ ] **Step 4:** Rodar — Expected: PASS.
- [ ] **Step 5:** Commit (com confirmação): `feat: morph transition and tunnel rows`.

### Task 9: Imagens, SEO e prompts do Gemini
**Files:** Create: `docs/prompts-gemini.md`, `public/projetos/<id>/` (placeholders), `public/og.png`; Modify: `index.html`; Test: `src/lib/assets.test.ts`
**Interfaces:** Consumes: `projects.json`.

- [ ] **Step 1:** Teste: `every project capa and fundo path points to an existing file under public/`.
- [ ] **Step 2:** Rodar — Expected: FAIL.
- [ ] **Step 3:** Escrever um prompt por projeto (capa 2:3 e fundo 16:9, estilo e paleta únicos, sem texto na imagem) e gerar placeholders WebP; `<title>`, descrição e Open Graph no `index.html`.
- [ ] **Step 4:** Rodar — Expected: PASS.
- [ ] **Step 5:** Commit (com confirmação): `docs: gemini prompts, placeholders and meta`.

### Task 10: Camadas de qualidade e verificação final
**Files:** Modify: conforme achados.

- [ ] **Step 1:** Rodar em ordem, uma sobre o resultado da anterior: `engineering:code-review`, `ecc-security-review`, `design:design-critique` e `impeccable`, `design:accessibility-review`, `design:ux-copy`, `searchfit-seo:seo-check`, `/ponytail-review` (sem remover validação, acessibilidade, testes ou comentários). Fundir conflitos como manda o CLAUDE.md.
- [ ] **Step 2:** `npm run lint && npm run test && npm run build` — Expected: tudo PASS.
- [ ] **Step 3:** Conferir manualmente em largura de desktop e de celular, com WebGL desligado e com movimento reduzido.
- [ ] **Step 4:** Entregar o relatório (camada, skill, o que mudou), fusões, dúvidas e o que não foi verificado. Deploy só com confirmação.
