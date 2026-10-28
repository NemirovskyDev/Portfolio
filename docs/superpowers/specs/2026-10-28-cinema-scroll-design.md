# Cinema Scroll: redesign do portfólio (spec)

Data: 2026-10-28 · Autor: Bernardo Nemirovsky · Status: aguardando revisão
Substitui a parte visual de `2026-10-23-portfolio-design.md`. Conteúdo, dados, imagens, modal, idiomas e deploy continuam valendo. Contexto de produto: `PRODUCT.md`.

## 1. Entendimento
**Você disse:** o site em estilo Netflix ficou sem interação de scroll e sem o 3D que se vê hoje. Direção escolhida: A, "Cinema Scroll". A tela de perfis não é obrigatória. Visitante principal: recrutador com poucos minutos. Diferencial: variedade real (IA, web, hardware, hackathon) com foco em IA e agentes. Ficam PT/EN, o link direto de cada projeto e os 10 projetos com os textos atuais.
**Premissas minhas:** (a) as alterações ficam na `main` e nada é enviado ao GitHub sem seu OK; (b) o modal de projeto atual é mantido; (c) uma fonte nova de títulos será instalada (precisa da sua confirmação, ver seção 8).

**Critérios de sucesso**
- Em uma tela, o visitante entende quem é, o que faz e que há 10 projetos reais.
- Rolar a página passa de projeto em projeto, com 3D e cor reagindo ao scroll, e fica suave no desktop e no celular.
- Com movimento reduzido, sem WebGL ou em celular fraco, o site continua completo e legível.
- Qualquer projeto abre em um clique ou por link direto, e tudo se usa pelo teclado.
- Lint, testes e build passam antes de qualquer entrega.

## 2. Contrato de direção (Impeccable, modo Experience)
**THESIS:** o scroll é o botão de play. Cada projeto é um capítulo de um filme, e a página inteira assume a cor do capítulo em que você está. Recusa o padrão "hero + fileiras de cartões iguais" e o "preto com um acento neon".
**OWN-WORLD:** cabine de projeção. Cada capítulo tem uma matiz própria, escolhida por projeto a partir de algo verdadeiro dele (cor da marca ou a cor não-âmbar das imagens, porque todas as imagens do Gemini compartilham o brilho âmbar); o ground é essa matiz escurecida (luminosidade ~12 a 16%); o texto é branco quente; o acento é a mesma matiz, clareada até 4,5:1 de contraste. Tarja preta de letterbox no topo e na base da cena, grão de filme sutil, barra de tempo de vídeo. Títulos em fonte condensada de créditos de filme (League Gothic) em caixa alta e grandes; corpo em Inter. Numerais tabulares para "capítulo 03 / 10".
**STORY:** o visitante entende em segundos quem é Bernardo e que há 10 projetos reais; avança pelo scroll; abre pelo menos um projeto em profundidade; sai associando Bernardo a "IA, web e hardware" e com os links de GitHub e LinkedIn.
**FIRST VIEWPORT:** tela cheia, ground quase preto. Ao centro, "BERNARDO NEMIROVSKY" em League Gothic, ocupando mais de 60% da largura, com uma linha embaixo em Inter ("Engenharia de Computação, foco em IA e agentes") e "10 projetos". Atrás, a prateleira 3D com as capas em arco, ligeiramente desfocadas, já se movendo com o mouse. Na base, a barra de tempo com 10 marcadores e a indicação "role para começar". Sem rótulo acima do título.
**FORM:** scrollytelling em cena fixa (direção A, escolhida pelo usuário, sem sorteio). seed: none (unavailable)
**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## 3. Estrutura da página
1. **Cabeçalho** (fixo): nome, botão "Índice", alternância PT/EN. Sem "Trocar perfil".
2. **Palco** (um bloco alto com cena fixa): altura = (capítulos + 2) × 130 vh. Dentro, `position: sticky` com a cena 3D, as tarjas e o texto do capítulo ativo.
3. **Capítulo 0: abertura** (seção 2, FIRST VIEWPORT).
4. **Capítulos 1 a 10: projetos**, na ordem IA e Agentes, Sites, Hackathons, Hardware, Universidade, Ferramentas (a ordem dentro de cada categoria segue o `projects.json`). Cada um mostra: título gigante, resumo, categoria e status, até 4 etiquetas de tecnologia e "Ver detalhes".
5. **Créditos** (final): "Sobre mim e contato", links de GitHub e LinkedIn, um "voltar ao início".
6. **Barra de tempo** (fixa na base): marcadores por capítulo agrupados por categoria, capítulo atual e título, clique ou teclado para pular.
7. **Índice** (painel): grade com os 10 projetos (os cartões atuais), para ir direto a um deles.
8. **Modal de projeto**: o atual, aberto por "Ver detalhes" ou `#/p/<id>`.

## 4. Movimento (um momento principal)
- **Progresso único:** `scrollYProgress` do palco vira um valor `f` de 0 a N. A cena 3D, o texto, a cor e a barra leem esse mesmo valor.
- **Cena 3D (React Three Fiber):** capas em arco no eixo Z. Para cada capa, com `d = i - f`: x = d × 3,2; z = −|d| × 1,6; giro em Y = −d × 0,35; escala de 1 a 1,7 quando `|d|` < 0,5; opacidade 1 − min(1, |d|) × 0,6. Um plano grande ao fundo mostra o fundo 16:9 do capítulo atual e do vizinho com mistura por `f` (parallax leve com o mouse).
- **Texto (HTML):** o título de cada capítulo entra por linhas (clip) e sai subindo. Só o capítulo ativo é visível e focável; os outros ficam `visibility: hidden`, mas existem no HTML.
- **Cor:** o ground interpola entre as cores dos capítulos por `f`; `--ink` e `--accent` acompanham.
- **Abrir projeto:** o modal cresce a partir do botão (clip-path). Sem mudança de lógica.
- **Inércia:** Lenis, como hoje, pausado com o modal aberto.
- **Orçamento:** um único Canvas, DPR até 1,5 (1,25 no celular), texturas das capas em 800×1200 e dos fundos só para o capítulo atual e os vizinhos; só `transform` e `opacity` no HTML; pausa quando a aba está oculta.

## 5. Fallbacks (sem 3D e sem movimento)
Ativos com `prefers-reduced-motion`, sem WebGL, erro do canvas ou celular de baixa capacidade:
- Capítulos empilhados, cada um com `min-height: 100svh`, fundo = imagem do projeto e cor do capítulo, texto estático, sem Lenis, sem transformações.
- A barra de tempo vira uma lista de links de âncora; o Índice continua.
- Todo conteúdo e todo botão funcionam igual.

## 6. Dados e componentes
- **Novo `src/data/palette.json`** (gerado por `scripts/extract-palette.py`, Pillow, com uma tabela de matizes por projeto): por projeto, `ground`, `accent`, `ink` em hex. Um teste confere contraste mínimo (texto 4,5:1, acento 4,5:1) e que todo `id` de projeto tem cor.
- **Novos:** `CinemaStage`, `ChapterText`, `TimelineBar`, `IndexPanel`, `Credits`, `StaticChapters`, `scenes/ShelfScene.tsx`, `lib/chapters.ts` (ordem, `chapterAt(f)`), `lib/useStageProgress.ts`.
- **Removidos:** `ProfileGate`, `OrbitBackdrop`, `OrbitScene`, `MorphTransition`, `morphLayout`, `Row`, `RevealRows`, `Hero` e a lógica de perfis (`profiles.ts`, estado de perfil).
- **Mantidos:** `projects.json`, `validate`, `i18n` (limpo das chaves de perfil), `AppState` (só idioma), `ProjectModal`, `ProjectCard` (usado no Índice), `useHashProject`, `useReducedMotion`, `useSmoothScroll`, `hasWebGL`, `CanvasBoundary`, `LangToggle`, `About` (vira Créditos).

## 7. Falhas, acessibilidade e testes
- **Falhas:** textura que não carrega mostra um retângulo da cor do capítulo; erro no canvas cai no fallback; `#/p/id` inexistente abre só a página.
- **Acessibilidade:** conteúdo em HTML real, navegação completa por teclado (barra de tempo e Índice como lista de botões), foco visível, contraste conferido por teste, `aria-current` no capítulo ativo, a cena 3D é decorativa (`aria-hidden`), movimento reduzido respeitado em tudo (cena, cor, texto, Lenis).
- **Testes (vitest):** `chapterAt` e a ordem dos capítulos; paleta e contraste; barra de tempo (clique, teclado, `aria-current`); fallback sem WebGL e com movimento reduzido mostra todos os capítulos; Índice abre e fecha com `Esc`; hash abre o modal; troca de idioma; só o capítulo ativo é focável. Verificação final manual no desktop e no celular (screenshots), com o revisor final do Impeccable.

## 8. Dependências, riscos e fora do escopo
- **Dependência nova (pede sua confirmação):** `@fontsource/league-gothic` (títulos). Nenhuma outra: Three.js, R3F, drei, motion e Lenis já existem.
- **Riscos:** (1) peso da cena no celular, mitigado por DPR menor, texturas só do capítulo ativo e fallback; (2) cor do capítulo com contraste ruim, mitigado pelo teste de paleta; (3) a transição entre capítulos parecer lenta em scroll rápido, mitigado por `f` contínuo (sem etapas).
- **Fora do escopo:** novo conteúdo dos projetos, nova geração de imagens, som, formulário de contato, qualquer envio ao GitHub sem seu OK.
