"""
Converts the hero sky from design-assets/hero/ into responsive images.

    python scripts/optimize-hero-assets.py

Outputs to src/assets/hero/:
    sky-<width>.avif, sky-<width>.webp   the full panorama, for landscape screens
    sky-square-<width>.avif              a crop for portrait screens

The originals are never modified. Requires Pillow 11.3+ for AVIF
(pip install pillow). Re-run whenever the source art changes.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design-assets" / "hero" / "sky-clouds-original-crop-4280x1500.png"
OUT = ROOT / "src" / "assets" / "hero"
AVIF_WIDTHS = (1280, 2560, 3200, 4280)
WEBP_WIDTHS = (1280, 2560, 4280)
SQUARE_WIDTHS = (1000, 1500)
# At object-position 62%, every viewport up to 1:1 shows only this slice of the
# panorama, so the crop frames identically at the same object-position.
SQUARE_BOX = (1724, 0, 3224, 1500)
AVIF_QUALITY = 45  # checked by eye: the halftone in the clouds survives


def scaled(image, width):
    if width == image.width:
        return image
    return image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sky = Image.open(SRC).convert("RGB")
    for width in AVIF_WIDTHS:
        scaled(sky, width).save(OUT / f"sky-{width}.avif", quality=AVIF_QUALITY, speed=6)
    for width in WEBP_WIDTHS:
        scaled(sky, width).save(OUT / f"sky-{width}.webp", quality=80, method=6)
    square = sky.crop(SQUARE_BOX)
    for width in SQUARE_WIDTHS:
        scaled(square, width).save(OUT / f"sky-square-{width}.avif", quality=AVIF_QUALITY, speed=6)
    for f in sorted(OUT.iterdir()):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
