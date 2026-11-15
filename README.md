# Learn Through Video

Animated, narrated learning videos built with [Remotion](https://www.remotion.dev/) (React → MP4).

## Video 1 — The Big Three: BlackRock, Vanguard, State Street

A ~10-minute animated lesson adapted from the IBF article *"The Big Three: BlackRock, Vanguard, State Street"*
(Mutual Funds & ETFs; published Feb 27, 2026; updated Nov 14, 2026). The figures in the video are the article's
dated examples (2025 company AUM, 2026 product disclosures) and its hypothetical cost budget — not current data.

- Rendered video: `out/big-three.mp4` (1920×1080, 30 fps, ~10 min)
- 21 scenes with on-screen subtitles and narration
- Narration voice: offline text-to-speech (SVOX Pico via `pico2wave`) — swap in a studio voice by replacing the
  files in `public/audio/` and re-running the timing step (see below)

## Project layout

```
src/
  content/script.json   # narration script: scenes → lines (text shown as subtitle, optional spoken override)
  content/timing.json   # generated: audio duration + per-line start/end for every scene
  timeline.ts           # turns script + timing into frame ranges
  Root.tsx, Video.tsx   # Remotion composition ("BigThree")
  components/           # animation primitives (Appear, Counter, Card, Chip, Stamp, …) and the scene frame
  scenes/part1-3.tsx    # the 21 scene components
scripts/
  build-audio.mjs       # text-to-speech → public/audio/*.m4a + src/content/timing.json
  stills.mjs            # render preview stills for QA
public/audio/           # generated narration clips (one per scene)
```

## Build

```bash
npm install
# 1) narration + timings (needs pico2wave + ffmpeg: apt-get install libttspico-utils ffmpeg)
TTS_TEMPO=1.2 TTS_GAP=0.3 node scripts/build-audio.mjs
# 2) preview in the browser
npx remotion studio
# 3) render
npx remotion render src/index.ts BigThree out/big-three.mp4 --codec h264 --crf 23
```

`remotion.config.ts` points Remotion at a pre-installed Chromium when one exists at the cloud-container path;
set `BROWSER_EXECUTABLE` to override, or remove that line to let Remotion download its own browser.

## Editing the lesson

- Change wording in `src/content/script.json`, then re-run `scripts/build-audio.mjs` — scene lengths and
  subtitle timings follow the audio automatically.
- Each scene component reads `L(i)` (start time of narration line *i*) from the scene context, so visuals stay
  synced to the narration when the script changes.
