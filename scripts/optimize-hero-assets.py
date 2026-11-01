"""
Converts the hero sky from design-assets/hero/ into responsive WebP files.

    python scripts/optimize-hero-assets.py

Outputs src/assets/hero/sky-<width>.webp. The originals are never modified.
Requires Pillow (pip install pillow). Re-run whenever the source art changes.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design-assets" / "hero" / "sky-clouds-original-crop-4280x1500.png"
OUT = ROOT / "src" / "assets" / "hero"
WIDTHS = (1280, 2560, 4280)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sky = Image.open(SRC).convert("RGB")
    for width in WIDTHS:
        height = round(sky.height * width / sky.width)
        resized = sky if width == sky.width else sky.resize((width, height), Image.LANCZOS)
        resized.save(OUT / f"sky-{width}.webp", quality=80, method=6)
    for f in sorted(OUT.glob("*.webp")):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
