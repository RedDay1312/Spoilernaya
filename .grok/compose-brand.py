#!/usr/bin/env python3
"""Compose share-card art from in-game stills when Imagine is unavailable."""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ART = Path("/workspace/artifacts/imagine_images")
APARTMENT = ART / "3fa65799-9cd4-4e14-9453-bd68195da1b2.jpg"
PORTRAIT = ART / "4ef3c1b5-0792-400c-a435-1a56beaa62f7.jpg"
CHAT = ART / "1f1dec7e-47f9-4727-b52f-9a21859aaadf.jpg"
KITCHEN = ART / "8c246ffc-28c8-418c-91ee-4129734bfaaa.jpg"

NEAR_BLACK = (11, 10, 9)
WARM_ELEV = (22, 20, 18)
BONE = (236, 230, 220)
DUST = (154, 148, 138)
ACCENT = (196, 191, 182)

SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

TITLE = "Спойлерная"


def cover_crop(im: Image.Image, w: int, h: int) -> Image.Image:
    src_w, src_h = im.size
    scale = max(w / src_w, h / src_h)
    nw, nh = max(1, round(src_w * scale)), max(1, round(src_h * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return im.crop((left, top, left + w, top + h))


def grade(im: Image.Image, darken: float = 0.68, color: float = 0.82, contrast: float = 1.18) -> Image.Image:
    im = ImageEnhance.Brightness(im).enhance(darken)
    im = ImageEnhance.Color(im).enhance(color)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    overlay = Image.new("RGB", im.size, NEAR_BLACK)
    return Image.blend(im.convert("RGB"), overlay, 0.18)


def vignette(im: Image.Image, strength: float = 0.72, inner: float = 0.35) -> Image.Image:
    w, h = im.size
    y, x = np.ogrid[:h, :w]
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    rx, ry = w * 0.62, h * 0.72
    r = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
    fall = np.clip((r - inner) / (1.15 - inner), 0, 1)
    fall = fall**1.35 * strength
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    shade = np.array(NEAR_BLACK, dtype=np.float32)
    out = rgb * (1.0 - fall[..., None]) + shade * fall[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def film_grain(im: Image.Image, amount: float = 7.0) -> Image.Image:
    w, h = im.size
    rng = np.random.default_rng(42)
    noise = rng.normal(0, amount, (h, w, 1)).astype(np.float32)
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    out = np.clip(rgb + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(out)


def horizontal_fade(im: Image.Image, side: str, frac: float) -> Image.Image:
    """Fade one side of an RGBA image to transparent."""
    im = im.convert("RGBA")
    w, h = im.size
    arr = np.asarray(im).copy()
    n = max(1, int(w * frac))
    ramp = np.linspace(0.0, 1.0, n, dtype=np.float32)
    if side == "left":
        arr[:, :n, 3] = (arr[:, :n, 3].astype(np.float32) * ramp[None, :]).astype(np.uint8)
    else:
        arr[:, w - n :, 3] = (arr[:, w - n :, 3].astype(np.float32) * ramp[None, ::-1]).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def vertical_fade(im: Image.Image, side: str, frac: float) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    arr = np.asarray(im).copy()
    n = max(1, int(h * frac))
    ramp = np.linspace(0.0, 1.0, n, dtype=np.float32)
    if side == "top":
        arr[:n, :, 3] = (arr[:n, :, 3].astype(np.float32) * ramp[:, None]).astype(np.uint8)
    else:
        arr[h - n :, :, 3] = (arr[h - n :, :, 3].astype(np.float32) * ramp[::-1, None]).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def tracked_width(text: str, font: ImageFont.FreeTypeFont, tracking: float) -> float:
    return sum(font.getlength(ch) for ch in text) + tracking * max(0, len(text) - 1)


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    text: str,
    center: tuple[float, float],
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    tracking: float,
    stroke_width: int = 0,
    stroke_fill: tuple[int, int, int] | None = None,
) -> tuple[float, float, float, float]:
    total = tracked_width(text, font, tracking)
    x = center[0] - total / 2
    y = center[1]
    for ch in text:
        draw.text(
            (x, y),
            ch,
            font=font,
            fill=fill,
            stroke_width=stroke_width,
            stroke_fill=stroke_fill,
            anchor="lm",
        )
        x += font.getlength(ch) + tracking
    # approximate bbox
    ascent, descent = font.getmetrics()
    return (
        center[0] - total / 2,
        center[1] - ascent,
        center[0] + total / 2,
        center[1] + descent,
    )


def rounded_rect(draw: ImageDraw.ImageDraw, box, fill, radius: int, outline=None, width: int = 1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def chat_chip(base: Image.Image, xy: tuple[int, int], name: str, body: str, scale: int, alpha: int = 200):
    font_n = ImageFont.truetype(SANS_BOLD, int(13 * scale / 2))
    font_b = ImageFont.truetype(SANS, int(13 * scale / 2))
    pad_x, pad_y = 14 * scale // 2, 10 * scale // 2
    name_w = font_n.getlength(name)
    body_w = font_b.getlength(body)
    w = int(max(name_w, body_w) + pad_x * 2)
    h = int(pad_y * 2 + font_n.size + font_b.size + 6)
    chip = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(chip)
    rounded_rect(d, (0, 0, w - 1, h - 1), (*WARM_ELEV, alpha), radius=max(6, 3 * scale // 2), outline=(*ACCENT, 90), width=1)
    d.text((pad_x, pad_y), name, font=font_n, fill=(*DUST, 255))
    d.text((pad_x, pad_y + font_n.size + 2), body, font=font_b, fill=(*BONE, 255))
    base.alpha_composite(chip, xy)


def compose_og(path: Path) -> None:
    W, H = 2400, 1260
    canvas = Image.new("RGB", (W, H), NEAR_BLACK)

    room = grade(cover_crop(Image.open(APARTMENT).convert("RGB"), W, H), darken=0.62, color=0.78, contrast=1.22)
    # bias crop a touch left so the lamp stays in frame after portrait overlay
    canvas.paste(room)
    canvas_rgba = canvas.convert("RGBA")

    # portrait, large, right-of-center, melted into the dark
    port = Image.open(PORTRAIT).convert("RGBA")
    pw = int(H * 1.12)
    port = port.resize((pw, pw), Image.Resampling.LANCZOS)
    # crop a bit of empty top so her eyes sit lower in the lockup
    crop_top = int(pw * 0.06)
    port = port.crop((0, crop_top, pw, pw))
    port = horizontal_fade(port, "left", 0.38)
    port = vertical_fade(port, "bottom", 0.18)
    port = vertical_fade(port, "top", 0.08)
    px = W - port.size[0] + int(W * 0.04)
    py = H - port.size[1] + int(H * 0.08)
    canvas_rgba.alpha_composite(port, (px, py))

    canvas = vignette(canvas_rgba.convert("RGB"), strength=0.78, inner=0.28)
    canvas = film_grain(canvas, amount=5.5)
    layer = canvas.convert("RGBA")

    # hanging-bulb glow
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gx, gy, gr = int(W * 0.46), int(H * 0.18), int(H * 0.22)
    for i, a in enumerate((28, 16, 8)):
        r = gr + i * 70
        gd.ellipse((gx - r, gy - r, gx + r, gy + r), fill=(236, 230, 210, a))
    glow = glow.filter(ImageFilter.GaussianBlur(48))
    layer.alpha_composite(glow)

    # chat chips — left side, below midline so they don't fight the title
    s = 2
    chat_chip(layer, (int(W * 0.05), int(H * 0.60)), "Архив", "ты ещё здесь?", s, 215)
    chat_chip(layer, (int(W * 0.07), int(H * 0.74)), "Хозяйка", "не открывай дверь", s, 195)

    draw = ImageDraw.Draw(layer)
    title_font = ImageFont.truetype(SERIF_BOLD, 168)
    tracking = 10
    # lockup centered both ways, generous margins — middle of the frame
    cx, cy = W / 2, H * 0.42
    # shadow pass
    for ox, oy in ((0, 4), (0, 8), (3, 6), (-3, 6)):
        draw_tracked(
            draw,
            TITLE,
            (cx + ox, cy + oy),
            title_font,
            fill=(11, 10, 9),
            tracking=tracking,
            stroke_width=6,
            stroke_fill=(11, 10, 9),
        )
    bbox = draw_tracked(
        draw,
        TITLE,
        (cx, cy),
        title_font,
        fill=BONE,
        tracking=tracking,
        stroke_width=2,
        stroke_fill=(40, 36, 32),
    )
    # thin rule under the lockup
    tw = bbox[2] - bbox[0]
    rule_y = bbox[3] + 18
    draw.line((cx - tw * 0.28, rule_y, cx + tw * 0.28, rule_y), fill=(*DUST, 180), width=2)

    out = layer.convert("RGB")
    path.parent.mkdir(parents=True, exist_ok=True)
    out.save(path, "PNG")
    print(f"og canvas {out.size} -> {path}")
    print(f"og title bbox x={bbox[0]:.0f}-{bbox[2]:.0f} y={bbox[1]:.0f}-{bbox[3]:.0f} "
          f"(frame {W}x{H}, mid-x {W/2:.0f}, y 25%-75% = {H*0.25:.0f}-{H*0.75:.0f})")


def compose_banner(path: Path) -> None:
    W, H = 2400, 528
    canvas = Image.new("RGB", (W, H), NEAR_BLACK)

    # wide band through the apartment lamp / furniture
    room = Image.open(APARTMENT).convert("RGB")
    # prefer the upper-middle of the room so the lamp reads in a short strip
    band = cover_crop(room, W, int(H * 1.35))
    band = band.crop((0, int(band.size[1] * 0.08), W, int(band.size[1] * 0.08) + H))
    if band.size[1] != H:
        band = cover_crop(room, W, H)
    canvas.paste(grade(band, darken=0.6, color=0.78, contrast=1.2))

    canvas_rgba = canvas.convert("RGBA")
    port = Image.open(PORTRAIT).convert("RGBA")
    ph = int(H * 2.15)
    port = port.resize((ph, ph), Image.Resampling.LANCZOS)
    # keep her face in the right overlay strip; scenery may sit under chrome
    crop_top = int(ph * 0.10)
    port = port.crop((0, crop_top, ph, min(ph, crop_top + H + 20)))
    port = horizontal_fade(port, "left", 0.42)
    port = vertical_fade(port, "bottom", 0.12)
    px = W - port.size[0] + 40
    py = H - port.size[1] + 10
    canvas_rgba.alpha_composite(port, (px, py))

    canvas = vignette(canvas_rgba.convert("RGB"), strength=0.7, inner=0.22)
    canvas = film_grain(canvas, amount=5.0)
    layer = canvas.convert("RGBA")

    # left-half glow so the lockup stays readable
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    vd.rectangle((0, 0, int(W * 0.55), H), fill=(11, 10, 9, 70))
    layer.alpha_composite(veil)

    draw = ImageDraw.Draw(layer)
    title_font = ImageFont.truetype(SERIF_BOLD, 96)
    tracking = 8
    # lockup in the LEFT HALF, ABOVE the midline, empty strip along the bottom
    cx = W * 0.27
    cy = H * 0.42
    for ox, oy in ((0, 3), (0, 6), (2, 4)):
        draw_tracked(
            draw,
            TITLE,
            (cx + ox, cy + oy),
            title_font,
            fill=(11, 10, 9),
            tracking=tracking,
            stroke_width=4,
            stroke_fill=(11, 10, 9),
        )
    bbox = draw_tracked(
        draw,
        TITLE,
        (cx, cy),
        title_font,
        fill=BONE,
        tracking=tracking,
        stroke_width=2,
        stroke_fill=(40, 36, 32),
    )
    tw = bbox[2] - bbox[0]
    rule_y = bbox[3] + 10
    draw.line((cx - tw * 0.28, rule_y, cx + tw * 0.28, rule_y), fill=(*DUST, 170), width=2)

    out = layer.convert("RGB")
    path.parent.mkdir(parents=True, exist_ok=True)
    out.save(path, "PNG")
    print(f"banner canvas {out.size} -> {path}")
    # safety: title must sit in left 50% × top 80%
    print(f"banner title bbox x={bbox[0]:.0f}-{bbox[2]:.0f} y={bbox[1]:.0f}-{bbox[3]:.0f} "
          f"(max x {W*0.5:.0f}, max y {H*0.8:.0f})")


if __name__ == "__main__":
    compose_og(Path("/workspace/.grok/og-raw.png"))
    compose_banner(Path("/workspace/.grok/x-banner-raw.png"))
