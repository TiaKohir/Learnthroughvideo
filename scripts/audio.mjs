// Narration audio + per-line timings for one lesson.
//   writes public/lessons/<slug>/audio/<scene>.m4a and lessons/<slug>/timing.json
// Engines (TTS_ENGINE): kokoro (default when models/kokoro exists — neural, offline; TTS_VOICE=af_heart),
//   pico (SVOX Pico via pico2wave), espeak (espeak-ng), or command — a shell template with {text} and {out}
//   placeholders, e.g. TTS_ENGINE=command TTS_COMMAND='say -o {out} --data-format=LEI16@22050 "{text}"'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync, execSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, lessonDir, readScript } from "./lib.mjs";

const spoken = (s) =>
  s
    .replace(/ETFs/g, "E T Fs")
    .replace(/ETF/g, "E T F")
    .replace(/\bAUM\b/g, "A U M")
    .replace(/\bSEC\b/g, "S E C")
    .replace(/\bSPYM\b/g, "S P Y M")
    .replace(/S&P 500/g, "S and P five hundred")
    .replace(/\bNAVs\b/g, "N A Vs")
    .replace(/\bNAV\b/g, "N A V")
    .replace(/\bIRA\b/g, "I R A")
    .replace(/\bAPR\b/g, "A P R")
    .replace(/\bAPY\b/g, "A P Y")
    .replace(/\bCFS\b/g, "C F S")
    .replace(/\bIBF\b/g, "I B F")
    .replace(/U\.S\./g, "U S")
    .replace(/iShares/g, "eye shares")
    .replace(/&/g, "and")
    .replace(/[—–]/g, ", ")
    .replace(/[“”"]/g, "")
    .replace(/[’]/g, "'")
    .replace(/[·•]/g, ",")
    .replace(/\s+/g, " ")
    .trim();

const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

const KOKORO_MODEL = join(ROOT, "models/kokoro/kokoro-quantized.onnx");
export const defaultEngine = () => process.env.TTS_ENGINE || (existsSync(KOKORO_MODEL) ? "kokoro" : "pico");

/** Synthesize every job ({text, out}) with the selected engine. */
const synthAll = (jobs) => {
  const engine = defaultEngine();
  if (engine === "kokoro") {
    const jobsFile = join(ROOT, ".tts-tmp", "jobs.json");
    writeFileSync(jobsFile, JSON.stringify(jobs));
    const voice = process.env.TTS_VOICE || "af_heart";
    console.log(`  engine: kokoro (voice ${voice}) — ${jobs.length} lines`);
    execFileSync("python3", [join(ROOT, "scripts/tts/kokoro_synth.py"), "--jobs", jobsFile, "--voice", voice, "--speed", process.env.TTS_SPEED || "1.0"], { stdio: "inherit" });
    return;
  }
  console.log(`  engine: ${engine} — ${jobs.length} lines`);
  for (const j of jobs) synth(j.text, j.out, engine);
};

const synth = (text, out, engine) => {
  if (engine === "pico") execFileSync("pico2wave", ["-l", process.env.TTS_LANG || "en-US", "-w", out, text]);
  else if (engine === "espeak") execFileSync("espeak-ng", ["-v", process.env.TTS_VOICE || "en-us+f3", "-s", "165", "-w", out, text]);
  else if (engine === "command") {
    const tpl = process.env.TTS_COMMAND;
    if (!tpl) throw new Error("TTS_ENGINE=command needs TTS_COMMAND with {text} and {out}");
    execSync(tpl.replace("{text}", text.replace(/"/g, "'")).replace("{out}", out), { stdio: "inherit" });
  } else throw new Error(`Unknown TTS_ENGINE ${engine}`);
};

export const buildAudio = (slug, { tempo = parseFloat(process.env.TTS_TEMPO || (defaultEngine() === "kokoro" ? "1.0" : "1.2")), gap = parseFloat(process.env.TTS_GAP || "0.35") } = {}) => {
  const lesson = readScript(slug);
  const OUT = join(ROOT, "public/lessons", slug, "audio");
  const TMP = join(ROOT, ".tts-tmp", slug);
  mkdirSync(OUT, { recursive: true });
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  const silence = join(TMP, "gap.wav");
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(gap), silence]);

  const timing = { fps: 30, tempo, gap, engine: defaultEngine(), voice: defaultEngine() === "kokoro" ? process.env.TTS_VOICE || "af_heart" : null, scenes: [] };
  const jobs = [];
  for (const scene of lesson.scenes)
    scene.lines.forEach((line, i) => jobs.push({ text: spoken(line.speech ?? line.text), out: join(TMP, `${scene.id}-${i}.raw.wav`) }));
  synthAll(jobs);

  let total = 0;
  for (const scene of lesson.scenes) {
    const parts = [];
    const lines = [];
    let cursor = 0;
    scene.lines.forEach((line, i) => {
      const raw = join(TMP, `${scene.id}-${i}.raw.wav`);
      const proc = join(TMP, `${scene.id}-${i}.wav`);
      const filters = [tempo !== 1 ? `atempo=${tempo}` : null, "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15", "areverse", "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.25", "areverse"].filter(Boolean).join(",");
      execFileSync("ffmpeg", ["-y", "-v", "error", "-i", raw, "-af", filters, "-ar", "44100", "-ac", "1", proc]);
      const d = dur(proc);
      lines.push({ start: +cursor.toFixed(3), end: +(cursor + d).toFixed(3) });
      cursor += d + gap;
      parts.push(proc, silence);
    });
    parts.pop();
    const list = join(TMP, `${scene.id}.txt`);
    writeFileSync(list, parts.map((p) => `file '${p}'`).join("\n"));
    const out = join(OUT, `${scene.id}.m4a`);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out]);
    const d = dur(out);
    total += d;
    timing.scenes.push({ id: scene.id, audio: `lessons/${slug}/audio/${scene.id}.m4a`, duration: +d.toFixed(3), lines });
    console.log(`  ${scene.id.padEnd(28)} ${d.toFixed(1)}s  (${scene.lines.length} lines)`);
  }
  writeFileSync(join(lessonDir(slug), "timing.json"), JSON.stringify(timing, null, 2));
  rmSync(TMP, { recursive: true, force: true });
  if (!existsSync(join(ROOT, ".tts-tmp"))) mkdirSync(join(ROOT, ".tts-tmp"));
  rmSync(join(ROOT, ".tts-tmp"), { recursive: true, force: true });
  const scenesPad = lesson.scenes.length * 1.5;
  console.log(`  narration ${(total / 60).toFixed(2)} min, video ≈ ${((total + scenesPad) / 60).toFixed(1)} min`);
  return timing;
};
