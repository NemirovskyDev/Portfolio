# Prompts de imagem para o Gemini

Duas imagens por projeto, sempre com o mesmo estilo para o catálogo ficar coerente.

| Imagem | Proporção | Arquivo (converter para WebP) | Onde aparece |
|---|---|---|---|
| Capa | vertical 2:3 (ex.: 1200x1800) | `cover.webp` | cards, órbita 3D e morph |
| Fundo | horizontal 16:9 (ex.: 1920x1080) | `backdrop.webp` | destaque do topo e modal |

**Regras para todas:** sem nenhum texto, letra, logotipo ou marca d'água dentro da imagem (os títulos são colocados pelo site). Sem pessoas reais identificáveis. Deixe o terço inferior mais escuro e com pouco detalhe, porque o título e os botões ficam sobre ele. Salve como WebP (qualidade 80) em `public/projetos/<id>/`. Enquanto não houver imagens, o site usa placeholders gerados.

## Estilo comum (cole no começo de todo prompt)
> Pôster cinematográfico em tom escuro, iluminação dramática com luz âmbar quente (#F5B83D) contra fundo quase preto azulado (#07080D), profundidade de campo rasa, leve granulação de filme, composição limpa com um único ponto focal, sem texto.

## Prompts

### Reveste — `public/projetos/reveste/`
- **Capa (2:3):** [Estilo comum] Um manequim elegante de alfaiataria em um provador luxuoso, com peças de roupa de marca penduradas em uma arara dourada, tons de lavanda e pêssego suaves misturados à luz âmbar.
- **Fundo (16:9):** [Estilo comum] Vista ampla de uma loja de roupas premium vazia ao entardecer, araras com peças bem alinhadas, espaço livre à esquerda para texto.

### PKZ Lab e One to One — `public/projetos/pkz/`
- **Capa (2:3):** [Estilo comum] Duas telas de laptop lado a lado em uma mesa de estúdio, uma com interface escura e outra clara, reflexos de luz âmbar, sem texto legível nas telas.
- **Fundo (16:9):** [Estilo comum] Estúdio de design com duas bancadas, uma em clima escuro neon e outra clara e minimalista, divididas ao meio por um feixe de luz.

### Tabbit — `public/projetos/tabbit/`
- **Capa (2:3):** [Estilo comum] Uma moeda digital brilhante flutuando sobre uma bandeja de refeição estilizada, partículas de luz em rede lembrando blockchain.
- **Fundo (16:9):** [Estilo comum] Mesa de restaurante à noite vista de cima com pratos coloridos e uma rede de linhas luminosas conectando os pratos, clima futurista.

### Orquestrador multiagente — `public/projetos/orquestrador/`
- **Capa (2:3):** [Estilo comum] Um regente de orquestra feito de luz no centro, três camadas de figuras abstratas (uma grande, uma média, várias pequenas) ligadas por fios luminosos.
- **Fundo (16:9):** [Estilo comum] Sala escura com um grande nó central brilhante conectado a dezenas de nós menores por feixes de luz, como uma constelação de agentes.

### Companion App e Validador — `public/projetos/companion/`
- **Capa (2:3):** [Estilo comum] Um celular em modo avião sobre uma mesa de jogo de tabuleiro, tela exibindo apenas formas e um escudo luminoso, cartas ao redor.
- **Fundo (16:9):** [Estilo comum] Mesa de jogo de tabuleiro futurista vista em ângulo, com peças, cartas e um celular emitindo um halo âmbar de verificação.

### Foi isso que eu pedi? (AP2) — `public/projetos/ap2/`
- **Capa (2:3):** [Estilo comum] Uma maquete de cidade futurista de 2050 em cima de um tabuleiro, prédios com balões de conversa luminosos sem texto.
- **Fundo (16:9):** [Estilo comum] Panorama de uma Cidade-Prompt em 2050 sobre um tabuleiro gigante, ruas de luz âmbar e prédios com formato de balões de fala.

### 3 Bombas — `public/projetos/bombas/`
- **Capa (2:3):** [Estilo comum] Placa Arduino Mega em primeiro plano com LEDs acesos, display de 7 segmentos brilhando e três pequenas bombas d'água ao fundo.
- **Fundo (16:9):** [Estilo comum] Bancada de eletrônica com protoboard, fios coloridos, potenciômetros, um display de 7 segmentos aceso e uma caixa impressa em 3D ao lado.

### Consulta à B3 — `public/projetos/b3/`
- **Capa (2:3):** [Estilo comum] Um painel de gráficos de candlestick em linhas finas de luz âmbar sobre fundo escuro, sem números legíveis.
- **Fundo (16:9):** [Estilo comum] Horizonte de uma cidade financeira ao anoitecer, com linhas de gráfico luminosas cruzando o céu, sem números ou letras.
