// Time-stretch a lesson's finished narration (pitch-preserving) and rescale timing.json to match.
// usage: node scripts/retime.mjs <slug> <factor>   e.g. 1.15 = 15% faster
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, lessonDir } from "./lib.mjs";

const [, , slug, f] = process.argv;
const factor = parseFloat(f);
if (!slug || !(factor > 0)) throw new Error("usage: node scripts/retime.mjs <slug> <factor>");
const tp = join(lessonDir(slug), "timing.json");
const timing = JSON.parse(readFileSync(tp, "utf8"));
const dur = (p) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
let total = 0;
for (const s of timing.scenes) {
  const file = join(ROOT, "public", s.audio);
  const tmp = file + ".tmp.m4a";
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", file, "-af", `atempo=${factor}`, "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", tmp]);
  renameSync(tmp, file);
  s.duration = +dur(file).toFixed(3);
  s.lines = s.lines.map((l) => ({ start: +(l.start / factor).toFixed(3), end: +(l.end / factor).toFixed(3) }));
  total += s.duration;
}
timing.tempo = +((timing.tempo ?? 1) * factor).toFixed(3);
writeFileSync(tp, JSON.stringify(timing, null, 2));
console.log(`retimed ${slug} by ${factor}: narration ${(total / 60).toFixed(2)} min`);
