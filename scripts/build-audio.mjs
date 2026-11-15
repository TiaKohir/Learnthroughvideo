// Generates narration audio (offline, pico2wave) and per-line timings for every scene.
// Usage: node scripts/build-audio.mjs   (env TTS_TEMPO=1.1 to change speaking speed)
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const script = JSON.parse(readFileSync(join(ROOT, "src/content/script.json"), "utf8"));
const TEMPO = parseFloat(process.env.TTS_TEMPO || "1.1");
const GAP = parseFloat(process.env.TTS_GAP || "0.35"); // seconds of silence between sentences
const OUT = join(ROOT, "public/audio");
const TMP = join(ROOT, ".tts-tmp");
mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const spoken = (s) =>
  s
    .replace(/ETFs/g, "E T Fs")
    .replace(/ETF/g, "E T F")
    .replace(/\bAUM\b/g, "A U M")
    .replace(/\bSEC\b/g, "S E C")
    .replace(/\bSPYM\b/g, "S P Y M")
    .replace(/S&P 500/g, "S and P five hundred")
    .replace(/\bNAV\b/g, "N A V")
    .replace(/\bNAVs\b/g, "N A Vs")
    .replace(/U\.S\./g, "U S")
    .replace(/iShares/g, "eye shares")
    .replace(/\bCFS\b/g, "C F S")
    .replace(/\bIBF\b/g, "I B F")
    .replace(/&/g, "and")
    .replace(/[—–]/g, ", ")
    .replace(/[“”"]/g, "")
    .replace(/[’]/g, "'")
    .replace(/·/g, ",")
    .replace(/\s+/g, " ")
    .trim();

const dur = (f) =>
  parseFloat(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString(),
  );

// one silence clip reused between sentences
const silence = join(TMP, "gap.wav");
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(GAP), silence]);

const timing = { fps: 30, tempo: TEMPO, gap: GAP, scenes: [] };
let total = 0;
for (const scene of script.scenes) {
  const parts = [];
  const lines = [];
  let cursor = 0;
  scene.lines.forEach((line, i) => {
    const text = spoken(line.speech ?? line.text);
    const raw = join(TMP, `${scene.id}-${i}.raw.wav`);
    const proc = join(TMP, `${scene.id}-${i}.wav`);
    execFileSync("pico2wave", ["-l", "en-US", "-w", raw, text]);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", raw, "-af", `atempo=${TEMPO}`, "-ar", "44100", "-ac", "1", proc]);
    const d = dur(proc);
    lines.push({ start: +cursor.toFixed(3), end: +(cursor + d).toFixed(3) });
    cursor += d + GAP;
    parts.push(proc, silence);
  });
  parts.pop(); // no trailing gap
  const list = join(TMP, `${scene.id}.txt`);
  writeFileSync(list, parts.map((p) => `file '${p}'`).join("\n"));
  const out = join(OUT, `${scene.id}.m4a`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list,
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out,
  ]);
  const d = dur(out);
  total += d;
  timing.scenes.push({ id: scene.id, audio: `audio/${scene.id}.m4a`, duration: +d.toFixed(3), lines });
  console.log(`${scene.id.padEnd(22)} ${d.toFixed(1)}s  (${scene.lines.length} lines)`);
}
writeFileSync(join(ROOT, "src/content/timing.json"), JSON.stringify(timing, null, 2));
rmSync(TMP, { recursive: true, force: true });
console.log(`narration total: ${(total / 60).toFixed(2)} min`);
