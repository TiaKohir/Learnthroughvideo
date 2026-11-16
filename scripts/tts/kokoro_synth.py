#!/usr/bin/env python3
"""Batch text-to-speech with Kokoro-82M (ONNX, fully offline).

usage: kokoro_synth.py --jobs jobs.json [--voice af_heart] [--speed 1.0]
jobs.json: [{"text": "...", "out": "/path/to/line.wav"}, ...]
Model + voices come from `npm run lesson -- setup-voice` (models/kokoro/).
"""
import argparse, json, os, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL = os.path.join(ROOT, "models", "kokoro", "kokoro-quantized.onnx")
VOICES = os.path.join(ROOT, "models", "kokoro", "voices.npz")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jobs", required=True)
    ap.add_argument("--voice", default=os.environ.get("TTS_VOICE", "af_heart"))
    ap.add_argument("--speed", type=float, default=float(os.environ.get("TTS_SPEED", "1.0")))
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--voices", default=VOICES)
    args = ap.parse_args()
    if not (os.path.exists(args.model) and os.path.exists(args.voices)):
        sys.exit("Kokoro model not found. Run: npm run lesson -- setup-voice")
    try:
        import soundfile as sf
        from kokoro_onnx import Kokoro
    except ImportError as e:  # pragma: no cover
        sys.exit(f"Missing Python package ({e}). Run: pip install -r requirements.txt")

    with open(args.jobs) as f:
        jobs = json.load(f)
    kokoro = Kokoro(args.model, args.voices)
    if args.voice not in kokoro.get_voices():
        sys.exit(f"Unknown voice {args.voice}. Available: {', '.join(kokoro.get_voices())}")
    t0 = time.time()
    total = 0.0
    for i, job in enumerate(jobs):
        samples, sr = kokoro.create(job["text"], voice=args.voice, speed=args.speed, lang=job.get("lang", "en-us"))
        sf.write(job["out"], samples, sr)
        total += len(samples) / sr
        print(f"  [{i + 1}/{len(jobs)}] {len(samples) / sr:5.1f}s  {job['text'][:70]}", flush=True)
    print(f"  synthesized {total / 60:.1f} min of speech in {(time.time() - t0) / 60:.1f} min ({args.voice})", flush=True)


if __name__ == "__main__":
    main()
