# Portfolio — Design System (MASTER)

Fonte: UI UX Pro Max (estilo Dark Mode OLED), adaptado em 2026-10-23. Aprovado pelo Bernardo.
Padrão de página ignorado (FAQ/Documentação): não se aplica a portfólio.

## Cores (tokens em `src/styles/tokens.css`)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#07080D` | fundo |
| `--card` | `#11131C` | cards, modal |
| `--fg` | `#F4F5F8` | texto principal |
| `--muted` | `#9AA3B5` | texto secundário |
| `--border` | `#2A2F3D` | bordas |
| `--accent` | `#F5B83D` | destaque, foco, botões primários |
| `--on-accent` | `#07080D` | texto sobre o acento |

Contraste mínimo AA (4.5:1), verificado por `src/styles/contrast.test.ts`.

## Tipografia
Inter (300–700), self-hosted via `@fontsource/inter`. Corpo 16px, line-height 1.5.

## Movimento
Entradas 300–450 ms, stagger de lista; saída mais rápida que entrada. Tudo desligado com `prefers-reduced-motion`.

## Regras
- Sem emoji como ícone (SVG). `cursor: pointer` em clicáveis. Foco visível (anel `--accent`).
- Responsivo: 375, 768, 1024, 1440 px. Sem rolagem horizontal da página.
- Sem logotipo, nome ou vermelho da Netflix.
