# Image prompts for Gemini

Two images per project, 16 in total. Each prompt is self-contained: paste it as is.

| Image | Aspect ratio | File (convert to WebP, quality 80) | Where it shows |
|---|---|---|---|
| Cover | vertical 2:3 (e.g. 1200x1800) | `cover.webp` | cards, 3D orbit and morph |
| Backdrop | horizontal 16:9 (e.g. 1920x1080) | `backdrop.webp` | hero and project modal |

Save each pair in `public/projetos/<id>/`. The site shows generated placeholders until the real files exist. If Gemini returns another ratio, ask it to "keep the 2:3 (or 16:9) aspect ratio". Titles are added by the site, so no image may contain text.

## Reveste: `public/projetos/reveste/`

Cover:
```text
Vertical 2:3 cinematic poster. A single elegant tailored mannequin in a luxurious fitting room, wearing a structured lavender blazer, with a gold clothing rail of designer garments glowing softly behind it. Warm amber rim light (#F5B83D) against a near-black blue background (#07080D), soft peach and lavender accents, 85mm portrait lens, shallow depth of field, fine film grain. Keep the lower third dark and quiet. No text, no letters, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 cinematic wide shot of an empty premium clothing boutique at dusk, long rows of neatly hung designer garments leading toward a tall window glowing amber (#F5B83D), polished floor reflections, near-black blue shadows (#07080D), pastel lavender and peach details. Open negative space on the left for text, shallow depth of field, fine film grain. No text, no letters, no logos, no watermark.
```

## PKZ Lab e One to One: `public/projetos/pkz/`

Cover:
```text
Vertical 2:3 cinematic poster. Two laptops side by side on a dark studio desk seen from a low three-quarter angle, the left one showing an abstract dark interface made of glowing blocks, the right one showing an abstract light interface, amber reflections (#F5B83D) spilling across the desk, near-black blue background (#07080D), macro lens, shallow depth of field, film grain. Screens show only shapes, never readable text. Lower third dark and quiet. No text, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 cinematic split-screen design studio: the left half is a moody dark workspace with neon-edged monitors, the right half is a bright minimalist workspace with white surfaces, divided in the middle by a vertical beam of amber light (#F5B83D). Near-black blue shadows (#07080D), wide-angle lens, subtle haze, film grain. No readable text on screens, no logos, no watermark.
```

## Tabbit: `public/projetos/tabbit/`

Cover:
```text
Vertical 2:3 cinematic poster. A glowing generic digital coin with no symbols hovers above a stylized meal tray holding a simple plate of food, thin luminous network lines and drifting light particles around it like a blockchain mesh, warm amber light (#F5B83D) on a near-black blue background (#07080D), product-photography macro lens, shallow depth of field, fine film grain. Lower third dark and quiet. No text, no letters, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 overhead shot of a restaurant table at night covered with colorful dishes, thin glowing amber lines (#F5B83D) connecting the plates like a futuristic network, soft bokeh city lights at the edges, near-black blue tones (#07080D), top-down 35mm lens, film grain. Open dark space on the left for text. No text, no letters, no logos, no watermark.
```

## Orquestrador multiagente: `public/projetos/orquestrador/`

Cover:
```text
Vertical 2:3 cinematic poster. A conductor figure made entirely of amber light (#F5B83D) stands in the center of a dark stage with arms raised, below it three tiers of abstract figures, one large, a few medium and many tiny, all linked by thin luminous threads, near-black blue background (#07080D), dramatic backlight, shallow depth of field, film grain. Lower third dark and quiet. No text, no letters, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 wide shot of a dark room floating with one large glowing amber node (#F5B83D) at the center, connected by fine beams of light to dozens of smaller nodes arranged like a constellation of agents, deep near-black blue space (#07080D), volumetric light, subtle depth haze, film grain. Open dark space on the right for text. No text, no letters, no logos, no watermark.
```

## Companion App e Validador: `public/projetos/companion/`

Cover:
```text
Vertical 2:3 cinematic poster. A smartphone lying on a board game table, its screen showing only a glowing amber shield shape (#F5B83D) and a small airplane-mode glow, game cards fanned out around it, near-black blue background (#07080D), low top-down angle, 50mm lens, shallow depth of field, film grain. Lower third dark and quiet. No text, no letters, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 angled view of a futuristic board game table with sculpted pieces and scattered cards, a smartphone in the foreground emitting a soft circular amber verification halo (#F5B83D), near-black blue room (#07080D), tilt-shift lens, volumetric light, film grain. Open dark space on the left for text. No text, no letters, no logos, no watermark.
```

## Foi isso que eu pedi? (AP2): `public/projetos/ap2/`

Cover:
```text
Vertical 2:3 cinematic poster. A miniature model of a futuristic city in the year 2050 standing on a game board, the buildings shaped like glowing speech bubbles without any writing, amber street light (#F5B83D) between them, near-black blue background (#07080D), tilt-shift macro lens, shallow depth of field, film grain. Lower third dark and quiet. No text, no letters, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 panorama of a futuristic Prompt City sprawling across a giant board game board, streets drawn as glowing amber lines (#F5B83D), skyscrapers shaped like speech bubbles with no writing, dusk haze, near-black blue sky (#07080D), wide cinematic lens, film grain. Open dark space on the left for text. No text, no letters, no logos, no watermark.
```

## 3 Bombas: `public/projetos/bombas/`

Cover:
```text
Vertical 2:3 cinematic poster. Extreme macro of an Arduino Mega board in the foreground with softly glowing LEDs and a 7-segment display lit amber (#F5B83D), three small water pumps blurred in the background, colorful jumper wires, near-black blue background (#07080D), 100mm macro lens, very shallow depth of field, film grain. Lower third dark and quiet. No text, no letters, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 wide shot of an electronics workbench in the dark, breadboard with jumper wires, potentiometers, a lit amber 7-segment display (#F5B83D) and a 3D-printed enclosure beside a small soldering iron, near-black blue shadows (#07080D), warm practical lamp light, 35mm lens, film grain. Open dark space on the right for text. No readable text, no logos, no watermark.
```

## Consulta à B3: `public/projetos/b3/`

Cover:
```text
Vertical 2:3 cinematic poster. An abstract candlestick chart made of thin glowing amber lines (#F5B83D) floating in a dark void with faint grid depth, no numbers or labels, near-black blue background (#07080D), anamorphic lens flare, shallow depth of field, film grain. Lower third dark and quiet. No text, no letters, no logos, no watermark.
```
Backdrop:
```text
Horizontal 16:9 financial city skyline at night, luminous amber chart lines (#F5B83D) arcing across the sky like trend curves, no numbers or letters, near-black blue sky (#07080D), wide anamorphic lens, soft haze, film grain. Open dark space on the left for text. No text, no letters, no logos, no watermark.
```
