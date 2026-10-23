# Portfólio em estilo catálogo — Design (spec)

Data: 2026-10-23 · Autor: Bernardo Nemirovsky · Status: aguardando revisão

## 1. Objetivo
Site de portfólio pessoal e geral que mostra os projetos já feitos no formato de um catálogo de streaming: capas em fileiras, e o clique abre os detalhes (para que serve, propósito, linguagens, papel, status e links). Tem animações 3D e imagens geradas no Gemini. Idiomas: PT-BR e EN. Tema escuro cinematográfico.

**Critérios de sucesso**
- Um visitante escolhe um perfil, vê o projeto em destaque, rola as fileiras e abre os detalhes de qualquer um dos 8 projetos.
- Fluidez no desktop e no celular de gama média. Sem WebGL, ou com movimento reduzido, o site continua completo.
- Conteúdo e links editáveis em um único arquivo de dados.
- Lint, testes e build passam antes de qualquer entrega.

**Fora do escopo (YAGNI):** backend, CMS, login, analytics, blog, formulário de contato com envio (só links), modelos 3D baixados, projetos sem nota no vault (Vídeo Apple Academy, PF, Jarvis, DevWeb).

## 2. Identidade
- Marca própria com wordmark do nome do Bernardo. Sem logotipo, nome nem vermelho exato da Netflix.
- Sistema de design (paleta, tipografia, cor de acento) gerado pelo UI UX Pro Max e salvo em `design-system/Portfolio/MASTER.md`. O spec só exige: fundo escuro, um acento único, contraste mínimo AA.

## 3. Stack
Vite + React + TypeScript, React Three Fiber (Three.js, drei), `motion` (antigo framer-motion), vitest + Testing Library, ESLint. Instalação do `motion` e de qualquer dependência nova só com confirmação do Bernardo.

## 4. Estrutura
```
Portfolio/
├── src/
│   ├── data/projects.json
│   ├── lib/ (i18n, profiles, validate)
│   ├── components/ ProfileGate, MorphTransition, Hero, Row, TunnelRows,
│   │               ProjectCard, ProjectModal, About, LangToggle
│   └── scenes/OrbitScene.tsx    (único uso de Three.js, carregado sob demanda)
├── public/projetos/<id>/cover.webp (2:3) e backdrop.webp (16:9)
├── design-system/Portfolio/MASTER.md
└── docs/ (spec, plano, prompts-gemini.md)
```
Estado de tela: `perfil → home`. O modal abre por hash (`#/p/<id>`), para link direto. Perfil e idioma ficam em `localStorage`, sempre dentro de `try/catch`, e o site renderiza sem eles.

## 5. Fluxo
1. **ProfileGate** ("Quem está assistindo?"): fundo com órbita 3D das capas e três perfis.
2. **MorphTransition**: ao escolher o perfil, as capas passam de espalhadas para círculo e depois para arco (~1,5 s) e abrem a home.
3. **Home**: Hero em destaque, fileiras por categoria em perspectiva de túnel (discreta), cards com tilt, e "Sobre mim e contato".
4. **ProjectModal**: animação a partir do card (layoutId), com imagem grande, resumo, propósito, papel, stack em etiquetas, status e links.

### Efeitos (todos recriados por nós, sem copiar código de terceiros)
| Efeito | Inspiração | Como |
|---|---|---|
| Órbita | Cosmos 3D Orbit Gallery (licença desconhecida) | planos com a textura das capas em anel, R3F, reação leve ao mouse |
| Morph | Scroll Morph Hero (licença desconhecida) | `motion`, interpolação de posição: dispersão → círculo → arco |
| Túnel | Perspective Tunnel Hero (MIT) | CSS `perspective` + `translateZ` ligado à rolagem; se reaproveitar código, manter o crédito MIT |

### Perfis
| Perfil | Ordem das fileiras | Destaque (hero) |
|---|---|---|
| Recrutador | IA e Agentes primeiro | Orquestrador |
| Dev | Sites e Hardware primeiro, stack em evidência | Reveste |
| Curioso | Ordem livre (padrão) | Tabbit |

## 6. Dados
Campos por projeto em `projects.json`: `id`, `categoria`, `capa`, `fundo`, `titulo{pt,en}`, `resumo{pt,en}`, `proposito{pt,en}`, `stack[]`, `papel{pt,en}`, `status` (`concluido` | `no-ar` | `em-andamento`), `links[]` (opcional). Validação ao carregar. Campo ausente gera erro claro no desenvolvimento e um fallback seguro em produção, sem derrubar o site.

### Projetos iniciais (fonte: vault)
| id | Categoria | Projeto | Stack | Status |
|---|---|---|---|---|
| reveste | Sites | Reveste: aluguel de roupas por assinatura | Next.js 16, React 19, Tailwind v4, motion, GSAP, R3F, zustand, Zod, vitest | no-ar |
| pkz | Sites | PKZ Lab e One to One (projeto extensionista) | HTML/CSS/JS | em-andamento (entrega 17/11) |
| tabbit | Hackathons | Tabbit: vale-refeição em USDC (Solana) | App web, Solana | no-ar |
| orquestrador | IA e Agentes | Prompt multiagente (Opus, Sonnet, Haiku) | Prompts, Claude Code | concluido |
| companion | IA e Agentes | Companion App / Validador v2 | HTML único, offline | em-andamento |
| ap2 | Universidade | "Foi isso que eu pedi?" (jogo de tabuleiro) | Scrum, Notion, Miro | em-andamento |
| bombas | Hardware | 3 Bombas no Arduino Mega 2560 | Arduino (C/C++) | em-andamento |
| b3 | Ferramentas | Consulta à B3 | Python, yfinance, scraping | em-andamento (bug de encoding) |

**Privacidade (regra do conteúdo):** sem endereço de cliente, sem nomes de times, sem dados de carteira ou finanças. Reveste mantém o aviso de que as pessoas dos looks são geradas por IA. Só Reveste (GitHub Pages) e Tabbit (Vercel) têm link público no vault; os demais ficam sem botão de demo até haver repositório.

## 7. Desempenho, acessibilidade e falhas
- Chunk do R3F carregado só na tela de perfis. Imagens WebP com `loading="lazy"`. DPR do canvas limitado. Animação pausada com a aba oculta.
- `prefers-reduced-motion`: sem canvas, morph nem túnel, só grid estático navegável.
- Sem WebGL ou erro no canvas: error boundary mostra o grid estático.
- Imagem com falha: placeholder com o título. Placeholders elegantes até as imagens do Gemini chegarem.
- Teclado completo, foco visível, modal com foco preso, `Esc` fecha e devolve o foco ao card. Textos alternativos nas imagens. `lang` do documento acompanha o idioma.
- SEO básico: `<title>`, descrição, Open Graph, textos do catálogo em HTML real.

## 8. Testes e verificação
- vitest: validação dos dados, ordenação por perfil, troca de idioma, abrir e fechar o modal por teclado, fallback sem WebGL e sem movimento.
- Antes de dizer "pronto": lint, testes e build verdes; conferência manual no desktop e em largura de celular.

## 9. Imagens (Gemini)
Entregar `docs/prompts-gemini.md` com um prompt por projeto, estilo único (pôster cinematográfico, paleta compartilhada, sem texto embutido na imagem): capa vertical 2:3 e fundo largo 16:9. Bernardo gera e solta os arquivos em `public/projetos/<id>/`.

## 10. Entrega e etapas
1. Spec aprovado → plano de implementação.
2. Receita do site novo: sistema de design (UI UX Pro Max), confirmação para instalar `motion`. O hero do 21st.dev virou referência de efeito, não código copiado.
3. Implementação em camadas e relatório de qualidade.
4. Deploy (GitHub Pages ou Vercel) somente com confirmação do Bernardo.

## 11. Riscos e decisões em aberto
- Três efeitos fortes podem pesar no celular: mitigados com fallback e movimento reduzido, e a conferir em aparelho real.
- Licenças "unknown" do Cosmos e do Scroll Morph: decisão tomada de recriar do zero.
- Cor de acento e tipografia ainda não definidas (saem do UI UX Pro Max).
- Inclusão futura dos projetos sem nota no vault (Vídeo Apple Academy, PF, Jarvis, DevWeb).
