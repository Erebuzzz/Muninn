from PIL import Image, ImageDraw
import os
import math

def draw_muninn_icon(size, is_round=False):
    # Create image with transparent background or dark background
    img = Image.new("RGBA", (size, size), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)

    scale = size / 100.0

    def pt(x, y):
        return (x * scale, y * scale)

    # If round, draw mask
    if is_round:
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((0, 0, size, size), fill=255)
    else:
        # Subtle rounded rectangle
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        radius = int(size * 0.2)
        mask_draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)

    # Outer sacred geometry circle
    r = 44 * scale
    draw.ellipse((50*scale - r, 50*scale - r, 50*scale + r, 50*scale + r), outline=(249, 115, 22, 160), width=max(1, int(1.5 * scale)))

    # Octagon runic polygon
    oct_pts = [pt(50,12), pt(85,26), pt(95,50), pt(85,74), pt(50,88), pt(15,74), pt(5,50), pt(15,26)]
    draw.polygon(oct_pts, outline=(56, 189, 248, 120), width=max(1, int(1 * scale)))

    # Left raven wing
    left_wing = [pt(50,22), pt(32,28), pt(18,38), pt(10,50), pt(18,54), pt(28,48), pt(22,60), pt(32,58), pt(40,50)]
    draw.polygon(left_wing, fill=(15, 23, 42, 240), outline=(249, 115, 22, 255), width=max(1, int(1.8 * scale)))

    # Right raven wing
    right_wing = [pt(50,22), pt(68,28), pt(82,38), pt(90,50), pt(82,54), pt(72,48), pt(78,60), pt(68,58), pt(60,50)]
    draw.polygon(right_wing, fill=(15, 23, 42, 240), outline=(249, 115, 22, 255), width=max(1, int(1.8 * scale)))

    # Central knot diamond
    diamond = [pt(50,34), pt(62,48), pt(50,66), pt(38,48)]
    draw.polygon(diamond, fill=(249, 115, 22, 60), outline=(56, 189, 248, 240), width=max(1, int(1.8 * scale)))

    # Interlocking tail
    tail = [pt(50,66), pt(56,76), pt(50,86), pt(44,76)]
    draw.polygon(tail, fill=(56, 189, 248, 70), outline=(56, 189, 248, 220), width=max(1, int(1.5 * scale)))

    # Crown
    crown = [pt(44,18), pt(50,14), pt(56,18), pt(50,26)]
    draw.polygon(crown, fill=(249, 115, 22, 255), outline=(251, 146, 60, 255), width=max(1, int(1.2 * scale)))

    # Celestial eyes
    er = max(1.5, 2.5 * scale)
    draw.ellipse((44*scale - er, 26*scale - er, 44*scale + er, 26*scale + er), fill=(56, 189, 248, 255))
    draw.ellipse((56*scale - er, 26*scale - er, 56*scale + er, 26*scale + er), fill=(56, 189, 248, 255))

    # Conduits
    draw.line([pt(50,34), pt(50,66)], fill=(251, 146, 60, 220), width=max(1, int(1.2 * scale)))
    draw.line([pt(38,48), pt(62,48)], fill=(56, 189, 248, 220), width=max(1, int(1.2 * scale)))

    final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    final_img.paste(img, (0, 0), mask)
    return final_img

def main():
    res_dir = r"D:\Muninn\frontend\android\app\src\main\res"
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    for folder, size in densities.items():
        dir_path = os.path.join(res_dir, folder)
        os.makedirs(dir_path, exist_ok=True)

        # Standard icon
        icon = draw_muninn_icon(size, is_round=False)
        icon.save(os.path.join(dir_path, "ic_launcher.png"), "PNG")

        # Round icon
        icon_round = draw_muninn_icon(size, is_round=True)
        icon_round.save(os.path.join(dir_path, "ic_launcher_round.png"), "PNG")

        # Foreground
        fg = draw_muninn_icon(size, is_round=False)
        fg.save(os.path.join(dir_path, "ic_launcher_foreground.png"), "PNG")

        print(f"Generated {folder} ({size}x{size})")

    # Also generate public favicon.ico and favicon.png for web
    web_icon = draw_muninn_icon(64, is_round=False)
    web_icon.save(r"D:\Muninn\frontend\public\favicon.ico", format="ICO")
    web_icon.save(r"D:\Muninn\frontend\src\app\favicon.ico", format="ICO")
    print("Generated web favicon.ico")

if __name__ == "__main__":
    main()
