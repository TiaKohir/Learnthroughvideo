#!/usr/bin/env python3
"""Packs single-voice Kokoro .bin style files into the voices.npz that kokoro-onnx expects."""
import glob, os, sys
import numpy as np

src, out = sys.argv[1], sys.argv[2]
voices = {}
for f in sorted(glob.glob(os.path.join(src, "*.bin"))):
    a = np.fromfile(f, dtype=np.float32)
    if a.size != 510 * 256:
        continue
    voices[os.path.basename(f)[:-4]] = a.reshape(510, 1, 256)
if not voices:
    sys.exit(f"no voice .bin files found in {src}")
np.savez(out, **voices)
print(f"packed {len(voices)} voices into {out}")
