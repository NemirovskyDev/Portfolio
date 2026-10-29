"""Builds src/data/palette.json: one ground/accent/ink triple per project.

Run from the project root: python scripts/extract-palette.py
(Windows Python cannot open paths over 260 characters, so keep the checkout path short.)
"""
import colorsys
import json
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "src" / "data" / "projects.json"
OUT = ROOT / "src" / "data" / "palette.json"

INK = "#f4f2ee"
NEUTRAL = {"ground": "#08090c", "ink": INK, "accent": "#f5b83d"}
BINS = 72  # 5 degrees each, so the amber band edges (15 and 55) fall on bin edges
MIN_VALUE = 0.15  # below this a pixel is near-black and carries no hue
MAX_WHITE = (0.92, 0.12)  # value above and saturation below: near-white
MIN_MEAN_SAT = 0.15  # below this the images are almost grey
GROUND_L = (0.12, 0.16)
GROUND_S = 0.42
ACCENT_S = 0.6
MIN_CONTRAST = 4.5
# Every Gemini image carries the same amber glow (about #F5B83D), so image hues cannot tell chapters apart.
# Hues are assigned by design, one per project; the image only reports its own hue and sets ground lightness.
HUES = {  # degrees, per project in chapter order (see CATEGORY_ORDER in src/lib/chapters.ts)
    "orquestrador": 215,  # blue: the cool glow of its backdrop
    "companion": 265,  # violet: the robots' palette in the game (blue, orange, violet, green)
    "jarvis": 185,  # cyan: the holographic panel
    "reveste": 335,  # rose: blush from the site's pastel identity
    "pkz": 230,  # indigo: PKZ's dark navy brand
    "chat-amigos": 290,  # purple: the violet glow of its backdrop
    "tabbit": 150,  # green: Tabbit's brand green
    "bombas": 35,  # amber: the workshop lamp
    "ap2": 320,  # magenta: the board's neon
    "b3": 170,  # teal: market night
    "tradingbot": 95,  # lime: the green of a rising candle
}
# Amber band, used only to report what the image says.
AMBER = (15, 55)
MIN_NON_AMBER = 0.10  # below this share of weight outside the band, the image is genuinely amber
# Same order as CATEGORY_ORDER in src/lib/chapters.ts; ties keep projects.json order.
CATEGORY_ORDER = ["IA e Agentes", "Sites", "Hackathons", "Hardware", "Universidade", "Ferramentas"]
NAMES = [(15, "red"), (30, "orange"), (55, "amber"), (70, "yellow"), (160, "green"), (185, "teal"),
         (205, "cyan"), (260, "blue"), (300, "violet"), (345, "magenta")]


def histogram(path):
    """Saturation x value weighted hue bins of a 64 px thumbnail, plus the saturation sum and pixel count."""
    img = Image.open(path).convert("RGB")
    img.thumbnail((64, 64))
    bins = [{"w": 0.0, "x": 0.0, "y": 0.0, "s": 0.0, "v": 0.0} for _ in range(BINS)]
    sat_sum = n = 0
    raw = img.tobytes()  # getdata() is deprecated in Pillow 14
    for r, g, b in zip(raw[0::3], raw[1::3], raw[2::3]):
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if v < MIN_VALUE or (v > MAX_WHITE[0] and s < MAX_WHITE[1]):
            continue
        sat_sum += s
        n += 1
        w = s * v
        b_ = bins[min(int(h * BINS), BINS - 1)]
        b_["w"] += w
        b_["x"] += w * math.cos(h * math.tau)
        b_["y"] += w * math.sin(h * math.tau)
        b_["s"] += w * s
        b_["v"] += w * v
    return bins, sat_sum, n


def merged(folder):
    """Backdrop and cover histograms summed, so one image alone never decides the hue."""
    total, sat_sum, n = None, 0, 0
    for name in ("backdrop.webp", "cover.webp"):
        bins, s, c = histogram(folder / name)
        sat_sum += s
        n += c
        total = bins if total is None else [{k: a[k] + b[k] for k in a} for a, b in zip(total, bins)]
    return total, sat_sum, n


def bin_hue(b):
    return (math.atan2(b["y"], b["x"]) / math.tau) % 1 * 360


def is_amber(i):
    return AMBER[0] <= i * 360 / BINS and (i + 1) * 360 / BINS <= AMBER[1]


def hue_name(deg):
    deg %= 360
    return next((name for edge, name in NAMES if deg < edge), "red")


def image_hue(bins, sat_sum, n):
    """Hue (degrees) the image itself suggests, ignoring the shared amber glow; None if grey."""
    total = sum(b["w"] for b in bins)
    if n == 0 or total == 0 or sat_sum / n < MIN_MEAN_SAT:
        return None
    outside = [b for i, b in enumerate(bins) if not is_amber(i)]
    share = sum(b["w"] for b in outside) / total
    pool = outside if share >= MIN_NON_AMBER else bins
    return bin_hue(max(pool, key=lambda b: b["w"]))


def mean_value(bins):
    """Weighted mean brightness of the colored pixels; sets how light the ground is."""
    return sum(b["v"] for b in bins) / sum(b["w"] for b in bins)


def hex_of(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return "#{:02x}{:02x}{:02x}".format(round(r * 255), round(g * 255), round(b * 255))


def luminance(hex_color):
    chans = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    r, g, b = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in chans]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def build(folder, hue_deg):
    backdrop = histogram(folder / "backdrop.webp")[0]
    hue = hue_deg / 360
    ground_l = GROUND_L[0] + (GROUND_L[1] - GROUND_L[0]) * mean_value(backdrop)
    ground = hex_of(hue, ground_l, GROUND_S)
    accent_l = ground_l
    # Raise lightness in 0.02 steps on the rounded hex, so the stored colors are what was measured.
    while True:
        accent_l = min(accent_l + 0.02, 1.0)
        accent = hex_of(hue, accent_l, ACCENT_S)
        if contrast(accent, ground) >= MIN_CONTRAST or accent_l >= 1.0:
            break
    return {"ground": ground, "accent": accent, "ink": INK}


def main():
    projects = json.loads(PROJECTS.read_text(encoding="utf-8"))
    missing = [p["id"] for p in projects if p["id"] not in HUES]
    if missing:
        raise SystemExit(f"no hue in HUES for: {', '.join(missing)}. Add one; hues are never invented.")
    rank = lambda p: CATEGORY_ORDER.index(p["categoria"]) if p["categoria"] in CATEGORY_ORDER else len(CATEGORY_ORDER)
    built = {}
    for p in sorted(projects, key=rank):  # stable: data order inside a category
        folder = ROOT / "public" / "projetos" / p["id"]
        entry = built[p["id"]] = build(folder, HUES[p["id"]])
        said = image_hue(*merged(folder))
        print(f"{p['id']:13} hue {HUES[p['id']]:3} {hue_name(HUES[p['id']]):8} "
              f"ground {entry['ground']} accent {entry['accent']} "
              f"contrast accent {contrast(entry['accent'], entry['ground']):.2f} "
              f"ink {contrast(INK, entry['ground']):.2f} "
              f"(image said {'grey' if said is None else f'{said:.0f}'})")
    palette = {"opening": NEUTRAL, **{p["id"]: built[p["id"]] for p in projects}, "credits": NEUTRAL}
    OUT.write_text(json.dumps(palette, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
