#!/usr/bin/env python3
"""
Generate public/og-image.png — the 1200x630 social share card.

Why this is a script rather than a hand-made file: the card has to be
regenerated whenever the logo, phone number, or positioning line changes, and a
checked-in binary with no source is impossible to tweak later.

The logo has a dark carbon-fibre background baked into it (it is not
transparent), so the canvas is built from a gradient in the logo's own tones.
That makes the composite seamless instead of showing a grey rectangle floating
on a near-black card.

Run:  python3 scripts/generate-og-image.py
Deps: pillow  (pip install pillow)
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "src/assets/royalty-luxury-logo.png"
OUT = ROOT / "public/og-image.png"

# Facebook/LinkedIn/iMessage all render 1.91:1, and Twitter's
# summary_large_image crops to the same ratio. 1200x630 is the safe size.
W, H = 1200, 630

GOLD = (217, 169, 40)
GOLD_SOFT = (232, 199, 110)
WHITE = (246, 246, 247)
MUTED = (158, 160, 166)

FONT_DIR = "/System/Library/Fonts/Supplemental"


MARGIN = 56


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"{FONT_DIR}/{name}", size)


def fitted(name: str, size: int, text: str, max_w: int) -> ImageFont.FreeTypeFont:
    """Largest size at or below `size` whose rendered text fits `max_w`.

    Guards the one failure mode that matters here: a longer phone number or
    tagline silently running off the right edge of the card, which is invisible
    until someone shares the link.
    """
    while size > 10:
        f = font(name, size)
        if f.getbbox(text)[2] <= max_w:
            return f
        size -= 1
    return font(name, 10)


def backdrop() -> Image.Image:
    """Vertical gradient in the logo's tones, plus a soft gold corner glow."""
    base = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(base)
    # Sampled from the logo's corners: lighter at the top, near-black at the
    # bottom, so the pasted logo blends into the canvas.
    for y in range(H):
        v = int(34 - 26 * (y / H))
        draw.line([(0, y), (W, y)], fill=(v, v, v))

    glow = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(glow).ellipse([W - 520, -300, W + 220, 300], fill=(92, 68, 12))
    glow = glow.filter(ImageFilter.GaussianBlur(150))

    # Screen blend brightens the corner without washing out the dark base.
    return ImageChops.screen(base, glow)


def main() -> None:
    card = backdrop()
    draw = ImageDraw.Draw(card)

    # --- Logo, left column -------------------------------------------------
    logo = Image.open(LOGO).convert("RGBA")
    target_h = 395
    scale = target_h / logo.height
    logo = logo.resize((round(logo.width * scale), target_h), Image.LANCZOS)
    logo_x, logo_y = MARGIN, (H - logo.height) // 2 - 4
    card.paste(logo, (logo_x, logo_y), logo)

    # --- Text, right column ------------------------------------------------
    x = logo_x + logo.width + 46
    col = W - x - MARGIN  # every line below is fitted to this width

    eyebrow = fitted("Georgia Bold.ttf", 22, "D A L L A S ,  T E X A S", col)
    h1 = fitted("Georgia Bold.ttf", 60, "Car & SUV", col)
    h2 = fitted("Georgia.ttf", 30, "Economy Cars · Premium SUVs", col)
    small = fitted("Georgia.ttf", 22, "Daily & weekly rates · Serving DFW", col)

    y = 152
    draw.text((x, y), "D A L L A S ,  T E X A S", font=eyebrow, fill=GOLD)
    y += 52
    draw.text((x, y), "Car & SUV", font=h1, fill=WHITE)
    y += 70
    draw.text((x, y), "Rentals", font=h1, fill=WHITE)
    y += 90
    draw.line([(x, y), (x + 88, y)], fill=GOLD, width=4)
    y += 30
    draw.text((x, y), "Economy Cars · Premium SUVs", font=h2, fill=GOLD_SOFT)
    y += 48
    draw.text((x, y), "Daily & weekly rates · Serving DFW", font=small, fill=MUTED)

    # Thin gold rule along the top edge as a brand accent.
    draw.rectangle([0, 0, W, 5], fill=GOLD)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    card.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB, {W}x{H})")


if __name__ == "__main__":
    main()
