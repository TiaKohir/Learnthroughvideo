# Learn Through Video

Turn an article into a narrated, animated explainer video.

```
lessons/<slug>/article.md   →   npm run lesson -- build <slug>   →   out/<slug>.mp4
```

Built on [Remotion](https://www.remotion.dev/) (React → MP4). Narration is generated offline with a neural
voice (Kokoro-82M), scene timings follow the audio automatically, and the script that drives the scenes is plain
JSON you can edit by hand. Every video shares one look: a neumorphic light theme (soft extruded cards on a
near-white surface) defined in `src/theme.ts`.

## Quick start

```bash
npm install
pip install -r requirements.txt           # Kokoro voice runtime (ONNX, CPU)
npm run lesson -- setup-voice             # downloads the model + voices from npm into models/kokoro (~110 MB)
# ffmpeg is required (Debian/Ubuntu: sudo apt-get install -y ffmpeg)

npm run lesson -- new my-article          # creates lessons/my-article/article.md
#   …paste the article into that file…
npm run lesson -- build my-article        # plan → narration → render  (out/my-article.mp4)
```

`build` runs these steps, which you can also run one at a time:

| Step | Command | What it does |
|---|---|---|
| plan | `npm run lesson -- plan <slug> [--minutes 10]` | `article.md` → `script.json` (scenes, narration lines, layout + data per scene) |
| audio | `npm run lesson -- audio <slug>` | `script.json` → `public/lessons/<slug>/audio/*.m4a` + `timing.json` (per-line timings) |
| prepare | `npm run lesson -- prepare <slug>` | points the Remotion composition at this lesson (`src/generated/`) |
| preview | `npm run lesson -- preview <slug>` | opens Remotion Studio to scrub through the lesson |
| stills | `npm run lesson -- stills <slug> [n]` | renders n preview frames to `out/<slug>/stills/` |
| render | `npm run lesson -- render <slug>` | renders `out/<slug>.mp4` (1920×1080, 30 fps, H.264) |

Typical loop: `plan` → open `script.json` and fix wording / layouts → `audio` → `stills` → `render`.

## The planner

`plan` writes `lessons/<slug>/script.json`. Two planners are available:

- **Claude planner** (recommended): used automatically when `ANTHROPIC_API_KEY` is set (or an `ant auth login`
  profile exists). It reads the whole article and writes the narration, picks a layout per scene, fills the
  layout's data and syncs each visual element to a narration line. Model: `claude-opus-5-5` by default
  (`PLANNER_MODEL` to override). It is instructed to stay faithful to the article and keep its hedges, but
  **always read the script before rendering** — it is the step where wording and numbers can drift.
- **Offline heuristic planner**: used when there are no credentials, or with `--offline`. Headings become
  chapters, paragraphs become scenes, and the layout is guessed from the text (numbers → stats, years →
  timeline, quotes → chat, lists → bullets). Serviceable, but expect to edit the result.

## Script format

`script.json` is validated against `src/lesson/schema.ts`. Hand-written scripts can use the relaxed form:

```jsonc
{
  "title": "The Big Three: BlackRock, Vanguard, State Street",
  "shortTitle": "The Big Three",            // header label
  "source": "Based on the IBF article …",   // used by the closing scene
  "scenes": [
    {
      "id": "04-dated-numbers",
      "chapter": "What “Big Three” Means",
      "layout": "stats",
      "lines": [                              // narration; each line becomes a subtitle
        { "text": "BlackRock reported approximately $14.0 trillion in AUM at year-end 2025.",
          "speech": "BlackRock reported approximately fourteen trillion dollars in assets under management at year-end 2025." },
        "State Street reported approximately $5.7 trillion."   // plain string = no spoken override
      ],
      "data": {
        "title": "Company totals are not fund totals",
        "stats": [
          { "label": "BlackRock AUM, year-end 2025", "value": 14.0, "prefix": "$", "suffix": "T", "decimals": 1, "line": 0 },
          { "label": "State Street AUM", "value": 5.7, "prefix": "$", "suffix": "T", "decimals": 1, "line": 1 }
        ],
        "footnote": "Dated examples; company totals include far more than U.S. index funds."
      }
    }
  ]
}
```

`line` on any item is the index of the narration line it should appear with; omit it for automatic pacing.

### Layouts

| layout | data fields | use for |
|---|---|---|
| `title` | `kicker`, `title`, `subtitle`, `chips[]` | opening scene |
| `bullets` | `title`, `items[{text, note}]`, `icon` (`check`/`cross`/`dot`/`number`) | general points |
| `contrast` | `title`, `pairs[{a, b, note}]` | things not to confuse (A ≠ B) |
| `compare` | `title`, `left{heading, items[], color}`, `right{…}`, `verdict` | two sides |
| `stats` | `title`, `stats[{label, value, prefix, suffix, decimals, note}]`, `footnote` | 1–4 big numbers |
| `timeline` | `title`, `events[{when, what}]` | dated events |
| `bars` | `title`, `bars[{label, value, display}]`, `unit`, `note` | comparable magnitudes |
| `flow` | `title`, `steps[{label, note}]` | sequences |
| `chat` | `title`, `messages[{who, text, side}]` | dialogue |
| `takeaways` | `title`, `items[]` | numbered recap |
| `closing` | `title`, `subtitle`, `points[]`, `chips[]`, `attribution`, `disclaimer` | last scene |
| `custom` | — | a React component from `lessons/<slug>/scenes.tsx` (see below) |

### Custom scenes

For scenes that deserve a bespoke animation, add `lessons/<slug>/scenes.tsx` exporting a
`Record<sceneId, React.FC>` and set that scene's `layout` to `"custom"`. Components get the narration timing
through `useScene()` (`L(i)` = start time of line *i*), and can use everything in `src/components/core.tsx`
(`Appear`, `Counter`, `Card`, `Chip`, `Stamp`, `Bullets`, `Bar`, …). `lessons/big-three/` is a complete example:
all 21 scenes are custom.

## Narration voice

Default engine is **Kokoro-82M** (Apache-2.0 model, run with ONNX Runtime on the CPU, fully offline). The model
and 50+ voice packs are fetched from two MIT-licensed npm packages by `npm run lesson -- setup-voice`, so the
only network access needed is the npm registry. Synthesis runs at roughly real time on 4 cores.

| Variable | Default | Meaning |
|---|---|---|
| `TTS_ENGINE` | `kokoro` if installed, else `pico` | `kokoro`, `pico` (SVOX Pico), `espeak`, or `command` |
| `TTS_VOICE` | `af_heart` | Kokoro voice: `af_*`/`am_*` American, `bf_*`/`bm_*` British (e.g. `am_michael`, `bf_emma`, `bm_george`) |
| `TTS_SPEED` | `1.0` | Kokoro speaking rate |
| `TTS_TEMPO` | `1.0` (kokoro) / `1.2` (pico) | extra time-stretch applied with ffmpeg |
| `TTS_GAP` | `0.35` | seconds of silence between narration lines |
| `TTS_COMMAND` | — | with `TTS_ENGINE=command`: shell template with `{text}` and `{out}` (WAV path), e.g. macOS `say -o {out} --data-format=LEI16@22050 "{text}"` |

To use a studio or cloud voice instead, point `TTS_COMMAND` at any CLI that writes a WAV file; per-line timings
and subtitles stay in sync because they are measured from the generated audio.

## Look and feel

`src/theme.ts` holds the colour tokens and the three neumorphic shadows (raised, small, inset). Layouts and
components only use tokens, so a palette change restyles every lesson. Keep the surface colour slightly off-white:
pure `#FFFFFF` hides the light half of the shadow pair and the depth disappears.

## Project layout

```
lessons/<slug>/
  article.md        input
  script.json       planned scenes (edit freely)
  timing.json       generated by `audio`
  scenes.tsx        optional custom scene components
public/lessons/<slug>/audio/   generated narration clips
models/kokoro/      voice model + packs (git-ignored; `setup-voice`)
src/
  lesson/schema.ts  the script schema (zod) shared by planner and renderer
  layouts/          the generic animated layouts
  components/       animation primitives + scene frame (header, subtitles, progress bar)
  theme.ts          colours, fonts, lead-in/tail timing
  generated/        written by `prepare` (git-ignored)
scripts/
  lesson.mjs        the CLI
  planner/          claude.mjs (API) and heuristic.mjs (offline)
  audio.mjs         text-to-speech + timing
  tts/              kokoro_synth.py (batch synthesis), build_voices.py
out/                renders (git-ignored)
```

## Lessons in this repo

- **big-three** — *The Big Three: BlackRock, Vanguard, State Street* (from an IBF article). ~10 min, 21 custom
  scenes, narrated by Kokoro `af_heart`. Figures are the article's dated 2025/2026 examples and a hypothetical cost budget, not current data.

## Notes

- Rendering uses the Chromium at `BROWSER_EXECUTABLE` if that path exists (defaults to the cloud-container path);
  otherwise Remotion downloads its own browser.
- A 10-minute 1080p render takes roughly 45–60 minutes on 4 CPU cores. Use `stills` to check scenes first.
- Fonts (Inter, JetBrains Mono) are bundled via `@fontsource`, so renders are reproducible offline.
