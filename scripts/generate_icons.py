"""Generate Peakwise app icons and splash screen using Pillow."""
import math, random, os
from PIL import Image, ImageDraw

def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def draw_icon(size=1024, for_adaptive=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    bg = Image.new("RGBA", (size, size))
    bd = ImageDraw.Draw(bg)
    for y in range(size):
        c = lerp((16, 8, 42), (5, 3, 16), y / size)
        bd.line([(0, y), (size, y)], fill=c + (255,))

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gcx, gcy, gr = size // 2, int(size * 0.46), int(size * 0.34)
    for r in range(gr, 0, -4):
        a = int(30 * (1 - r / gr))
        gd.ellipse([gcx-r, gcy-r, gcx+r, gcy+r], fill=(75, 45, 175, a))
    bg.alpha_composite(glow)

    radius = size // 6 if not for_adaptive else 0
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    img.paste(bg, mask=mask)

    draw = ImageDraw.Draw(img)
    cx = size // 2

    sp_apex = (int(cx - size * 0.15), int(size * 0.36))
    sp_base_y = int(size * 0.70)
    sp_hw = int(size * 0.13)
    sp_h = sp_base_y - sp_apex[1]
    for i in range(sp_h):
        t = i / sp_h
        c = lerp((48, 32, 105), (32, 22, 75), t)
        lx = int(sp_apex[0] - sp_hw * t)
        rx = int(sp_apex[0] + sp_hw * t)
        draw.line([(lx, sp_apex[1]+i), (rx, sp_apex[1]+i)], fill=c + (190,))

    apex_x, apex_y = cx, int(size * 0.19)
    base_y = int(size * 0.72)
    half_w = int(size * 0.27)
    peak_h = base_y - apex_y

    for i in range(peak_h):
        t = i / peak_h
        c = lerp((195, 185, 255), (82, 62, 182), t)
        lx = int(apex_x - half_w * t)
        rx = int(apex_x + half_w * t)
        draw.line([(lx, apex_y+i), (rx, apex_y+i)], fill=c + (255,))

    lw = max(2, size // 300)
    draw.line([(apex_x, apex_y), (apex_x - half_w, base_y)], fill=(215, 205, 255, 70), width=lw)
    draw.line([(apex_x, apex_y), (apex_x + half_w, base_y)], fill=(215, 205, 255, 70), width=lw)

    sc_h  = int(peak_h * 0.16)
    sc_hw = int(half_w * 0.16)
    draw.polygon([
        (apex_x, apex_y),
        (apex_x - sc_hw, apex_y + sc_h),
        (apex_x + sc_hw, apex_y + sc_h),
    ], fill=(238, 234, 255, 220))

    sr = int(size * 0.024)
    star_x, star_y = apex_x, apex_y - int(size * 0.008)
    for angle_deg in [0, 90, 45, 135]:
        angle = math.radians(angle_deg)
        long_r = sr * 3
        for sign in [1, -1]:
            a = angle + (math.pi if sign == -1 else 0)
            for s in range(long_r):
                t = s / long_r
                alpha = int(255 * (1 - t) ** 1.5)
                px = star_x + int(s * math.cos(a))
                py = star_y + int(s * math.sin(a))
                r = max(1, int((1 - t) * (2 if angle_deg in [0,90] else 1)))
                draw.ellipse([px-r, py-r, px+r, py+r], fill=(255, 252, 210, alpha))

    core_r = max(2, sr // 3)
    draw.ellipse([star_x-core_r, star_y-core_r, star_x+core_r, star_y+core_r],
                 fill=(255, 255, 240, 255))

    rng = random.Random(13)
    for _ in range(30):
        sx = rng.randint(int(size*0.04), int(size*0.96))
        sy = rng.randint(int(size*0.04), int(size*0.40))
        if abs(sx - apex_x) < size*0.07 and sy > apex_y - size*0.05:
            continue
        dr = rng.randint(1, max(2, size//180))
        draw.ellipse([sx-dr, sy-dr, sx+dr, sy+dr],
                     fill=(190, 185, 255, rng.randint(55, 165)))

    return img


def draw_splash(width=1280, height=1280):
    """Full-size splash that looks good with resizeMode: cover."""
    img = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(img)

    # Same dark gradient background
    for y in range(height):
        c = lerp((16, 8, 42), (4, 2, 14), y / height)
        draw.line([(0, y), (width, y)], fill=c + (255,))

    # Purple glow
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gcx, gcy, gr = width // 2, int(height * 0.44), int(min(width, height) * 0.38)
    for r in range(gr, 0, -5):
        a = int(28 * (1 - r / gr))
        gd.ellipse([gcx-r, gcy-r, gcx+r, gcy+r], fill=(75, 45, 175, a))
    img.alpha_composite(glow)

    draw = ImageDraw.Draw(img)
    cx = width // 2
    sz = min(width, height)

    # Secondary peak
    sp_apex = (int(cx - sz * 0.15), int(height * 0.36))
    sp_base_y = int(height * 0.70)
    sp_hw = int(sz * 0.13)
    sp_h = sp_base_y - sp_apex[1]
    for i in range(sp_h):
        t = i / sp_h
        c = lerp((48, 32, 105), (32, 22, 75), t)
        lx = int(sp_apex[0] - sp_hw * t)
        rx = int(sp_apex[0] + sp_hw * t)
        draw.line([(lx, sp_apex[1]+i), (rx, sp_apex[1]+i)], fill=c + (190,))

    # Main peak
    apex_x, apex_y = cx, int(height * 0.19)
    base_y = int(height * 0.72)
    half_w = int(sz * 0.27)
    peak_h = base_y - apex_y

    for i in range(peak_h):
        t = i / peak_h
        c = lerp((195, 185, 255), (82, 62, 182), t)
        lx = int(apex_x - half_w * t)
        rx = int(apex_x + half_w * t)
        draw.line([(lx, apex_y+i), (rx, apex_y+i)], fill=c + (255,))

    lw = max(2, sz // 300)
    draw.line([(apex_x, apex_y), (apex_x - half_w, base_y)], fill=(215, 205, 255, 70), width=lw)
    draw.line([(apex_x, apex_y), (apex_x + half_w, base_y)], fill=(215, 205, 255, 70), width=lw)

    sc_h  = int(peak_h * 0.16)
    sc_hw = int(half_w * 0.16)
    draw.polygon([
        (apex_x, apex_y),
        (apex_x - sc_hw, apex_y + sc_h),
        (apex_x + sc_hw, apex_y + sc_h),
    ], fill=(238, 234, 255, 220))

    sr = int(sz * 0.024)
    star_x, star_y = apex_x, apex_y - int(sz * 0.008)
    for angle_deg in [0, 90, 45, 135]:
        angle = math.radians(angle_deg)
        long_r = sr * 3
        for sign in [1, -1]:
            a = angle + (math.pi if sign == -1 else 0)
            for s in range(long_r):
                t = s / long_r
                alpha = int(255 * (1 - t) ** 1.5)
                px = star_x + int(s * math.cos(a))
                py = star_y + int(s * math.sin(a))
                r = max(1, int((1 - t) * (2 if angle_deg in [0,90] else 1)))
                draw.ellipse([px-r, py-r, px+r, py+r], fill=(255, 252, 210, alpha))
    core_r = max(2, sr // 3)
    draw.ellipse([star_x-core_r, star_y-core_r, star_x+core_r, star_y+core_r],
                 fill=(255, 255, 240, 255))

    rng = random.Random(13)
    for _ in range(35):
        sx = rng.randint(int(width*0.03), int(width*0.97))
        sy = rng.randint(int(height*0.03), int(height*0.40))
        if abs(sx - apex_x) < sz*0.07 and sy > apex_y - sz*0.05:
            continue
        dr = rng.randint(1, max(2, sz//160))
        draw.ellipse([sx-dr, sy-dr, sx+dr, sy+dr],
                     fill=(190, 185, 255, rng.randint(55, 165)))

    return img


def draw_adaptive_foreground(size=1024):
    """
    Android adaptive icon foreground — transparent background.
    Background color (#100828) is set in app.json and applied by the launcher.
    Content is centered in the ~66% safe zone so it looks good on all shapes.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Safe zone: center 72% of the canvas (a bit generous)
    pad = int(size * 0.14)
    cx = size // 2

    # Subtle glow (no background, just glow on transparent canvas)
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gcx, gcy, gr = cx, int(size * 0.46), int(size * 0.30)
    for r in range(gr, 0, -4):
        a = int(35 * (1 - r / gr))
        gd.ellipse([gcx-r, gcy-r, gcx+r, gcy+r], fill=(90, 55, 200, a))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)

    # Secondary peak — scaled to fit safe zone
    sp_apex = (int(cx - size * 0.13), pad + int((size - 2*pad) * 0.22))
    sp_base_y = pad + int((size - 2*pad) * 0.78)
    sp_hw = int(size * 0.11)
    sp_h = sp_base_y - sp_apex[1]
    for i in range(sp_h):
        t = i / sp_h
        c = lerp((55, 38, 118), (38, 26, 88), t)
        lx = int(sp_apex[0] - sp_hw * t)
        rx = int(sp_apex[0] + sp_hw * t)
        draw.line([(lx, sp_apex[1]+i), (rx, sp_apex[1]+i)], fill=c + (200,))

    # Main peak
    apex_x = cx
    apex_y = pad + int((size - 2*pad) * 0.04)
    base_y = pad + int((size - 2*pad) * 0.82)
    half_w = int((size - 2*pad) * 0.42)
    peak_h = base_y - apex_y

    for i in range(peak_h):
        t = i / peak_h
        c = lerp((200, 190, 255), (88, 68, 192), t)
        lx = int(apex_x - half_w * t)
        rx = int(apex_x + half_w * t)
        draw.line([(lx, apex_y+i), (rx, apex_y+i)], fill=c + (255,))

    lw = max(2, size // 300)
    draw.line([(apex_x, apex_y), (apex_x - half_w, base_y)], fill=(215, 205, 255, 80), width=lw)
    draw.line([(apex_x, apex_y), (apex_x + half_w, base_y)], fill=(215, 205, 255, 80), width=lw)

    # Snow cap
    sc_h  = int(peak_h * 0.15)
    sc_hw = int(half_w * 0.15)
    draw.polygon([
        (apex_x, apex_y),
        (apex_x - sc_hw, apex_y + sc_h),
        (apex_x + sc_hw, apex_y + sc_h),
    ], fill=(240, 236, 255, 225))

    # Star sparkle
    sr = int(size * 0.022)
    star_x, star_y = apex_x, apex_y - int(size * 0.006)
    for angle_deg in [0, 90, 45, 135]:
        angle = math.radians(angle_deg)
        long_r = sr * 3
        for sign in [1, -1]:
            a = angle + (math.pi if sign == -1 else 0)
            for s in range(long_r):
                t = s / long_r
                alpha = int(255 * (1 - t) ** 1.5)
                px = star_x + int(s * math.cos(a))
                py = star_y + int(s * math.sin(a))
                r = max(1, int((1 - t) * (2 if angle_deg in [0, 90] else 1)))
                draw.ellipse([px-r, py-r, px+r, py+r], fill=(255, 252, 210, alpha))
    core_r = max(2, sr // 3)
    draw.ellipse([star_x-core_r, star_y-core_r, star_x+core_r, star_y+core_r],
                 fill=(255, 255, 240, 255))

    # Stars in sky
    rng = random.Random(13)
    for _ in range(22):
        sx = rng.randint(pad, size - pad)
        sy = rng.randint(pad, pad + int((size - 2*pad) * 0.38))
        if abs(sx - apex_x) < size*0.07 and sy > apex_y - size*0.04:
            continue
        dr = rng.randint(1, max(2, size//200))
        draw.ellipse([sx-dr, sy-dr, sx+dr, sy+dr],
                     fill=(190, 185, 255, rng.randint(60, 160)))

    return img


def generate_all():
    os.makedirs("assets", exist_ok=True)

    draw_icon(1024, for_adaptive=False).save("assets/icon.png", "PNG")
    print("✓ assets/icon.png")

    # Adaptive icon: transparent background, content in safe zone
    draw_adaptive_foreground(1024).save("assets/adaptive-icon.png", "PNG")
    print("✓ assets/adaptive-icon.png  (transparent bg, content in safe zone)")

    draw_icon(64, for_adaptive=False).save("assets/favicon.png", "PNG")
    print("✓ assets/favicon.png")

    draw_splash(1280, 1280).save("assets/splash-icon.png", "PNG")
    print("✓ assets/splash-icon.png  (1280×1280 full-bleed)")


if __name__ == "__main__":
    generate_all()
