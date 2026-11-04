"""
Samples the two reaching hands out of the boot-screen reference video and prints
them as the HANDS rows used by public/loader.js.

    python scripts/extract-loader-hands.py [video] [seconds]

The video is a 96 x 54 grid of character cells. Each cell is classified by how
much of it is lit:
    .  empty
    x  glyph (X, 1, 0, >): the loader picks and scrambles the character itself
    o  white square
    b  blue square
Empty rows at the top and bottom are dropped. Requires ffmpeg on PATH. Paste the
output over the HANDS array in public/loader.js. The video itself never ships.
"""

import subprocess
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "src/assets/lsv.mp4"
AT = sys.argv[2] if len(sys.argv) > 2 else "2.5"  # hands formed, fingertips apart
W, H = 702, 396
COLS, ROWS = 96, 54
OFFSET_X = 1  # grid phase, found by maximising cell contrast

raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", AT, "-i", SRC, "-frames:v", "1",
     "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    capture_output=True, check=True,
).stdout


def cell(c, r):
    cw, ch = W / COLS, H / ROWS
    lit = blue = n = 0
    for y in range(int(r * ch), min(H, int((r + 1) * ch))):
        for x in range(int(OFFSET_X + c * cw), min(W, int(OFFSET_X + (c + 1) * cw))):
            i = (y * W + x) * 3
            red, green, b = raw[i], raw[i + 1], raw[i + 2]
            n += 1
            if red + green + b > 240:
                lit += 1
                blue += b > red + 60
    fill = lit / max(n, 1)
    if fill < 0.08:
        return "."
    if blue > lit / 2:
        return "b"
    return "o" if fill > 0.4 else "x"


rows = ["".join(cell(c, r) for c in range(COLS)) for r in range(ROWS)]
while rows and set(rows[0]) == {"."}:
    rows.pop(0)
while rows and set(rows[-1]) == {"."}:
    rows.pop()

print("  var HANDS = [")
for row in rows:
    print(f'    "{row}",')
print("  ];")
