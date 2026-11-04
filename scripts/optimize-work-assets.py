"""
Builds the web copies of the Work section media from src/assets/works/.

    python scripts/optimize-work-assets.py

Outputs to src/assets/works/web/:
    <id>-16x9.mp4, <id>-4x5.mp4     H.264 + AAC, +faststart, for the case-study player
    <id>-cover-<width>.avif/.webp   16:9 cover art, card and video stage
    <id>-poster-4x5.avif/.webp      first frame of the portrait cut, poster on phones
    hr-assistant-chat.avif/.webp    HR demo UI, cropped to the chat area (no company
                                    name or logo: the project is confidential)
    hazard-predictions.avif/.webp   validation predictions, lifted out of the case-study HTML

The originals are never modified. Requires ffmpeg on PATH and Pillow 11.3+ for
AVIF (pip install pillow). Re-run whenever a source file changes.
"""

import base64
import re
import subprocess
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "assets" / "works"
OUT = SRC / "web"

# id -> (cover art, landscape video, portrait video, x264 CRF)
# CRF is per video, checked by eye at 1:1: the hazard cut is covered in halftone
# dots, which cost H.264 a lot of bits, and 29 looks the same as 25 there.
VIDEOS = {
    "hr-assistant": ("HR_assistant_coverpage.jpg", "HR_assistant_PC.mp4", "HR_assistant_mobile.mp4", "25"),
    "hazard": (
        "hazardous-waste-detection_poster.png",
        "hazardous-waste-detection_PC.mp4",
        "hazardous-waste-detection_mobile.mp4",
        "29",
    ),
}
COVER_WIDTHS = (960, 1920)
POSTER_AT = "0.6"  # seconds into the portrait cut: the title card is up by then
AVIF_QUALITY = 50
X264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-profile:v", "high"]
AAC = ["-c:a", "aac", "-b:a", "96k", "-ac", "2"]
HR_CHAT_BOX = (14, 160, 1352, 720)  # below the app header, above the footer


def scaled(image, width):
    if width >= image.width:
        return image
    return image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)


def save_pair(image, stem):
    image.save(OUT / f"{stem}.avif", quality=AVIF_QUALITY, speed=6)
    image.save(OUT / f"{stem}.webp", quality=80, method=6)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    for key, (cover, landscape, portrait, crf) in VIDEOS.items():
        art = Image.open(SRC / cover).convert("RGB")
        for width in COVER_WIDTHS:
            save_pair(scaled(art, width), f"{key}-cover-{width}")

        ffmpeg("-i", SRC / landscape, "-vf", "scale=1280:-2:flags=lanczos", *X264, "-crf", crf, *AAC,
               "-movflags", "+faststart", OUT / f"{key}-16x9.mp4")
        ffmpeg("-i", SRC / portrait, "-vf", "scale=720:-2:flags=lanczos", *X264, "-crf", crf, *AAC,
               "-movflags", "+faststart", OUT / f"{key}-4x5.mp4")

        frame = subprocess.run(
            ["ffmpeg", "-v", "error", "-ss", POSTER_AT, "-i", SRC / portrait, "-frames:v", "1",
             "-vf", "scale=720:-2:flags=lanczos", "-f", "image2pipe", "-c:v", "png", "-"],
            check=True, capture_output=True,
        ).stdout
        save_pair(Image.open(BytesIO(frame)).convert("RGB"), f"{key}-poster-4x5")

    shot = Image.open(SRC / "Screenshot 2026-11-02 042444.png").convert("RGB")
    save_pair(shot.crop(HR_CHAT_BOX), "hr-assistant-chat")

    html = (SRC / "hazardous-waste-detection.html").read_text(encoding="utf8")
    data = re.search(r"data:image/jpeg;base64,([A-Za-z0-9+/=]+)", html).group(1)
    save_pair(Image.open(BytesIO(base64.b64decode(data))).convert("RGB"), "hazard-predictions")

    for f in sorted(OUT.iterdir()):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
