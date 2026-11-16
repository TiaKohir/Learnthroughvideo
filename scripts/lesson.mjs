#!/usr/bin/env node
// Article → animated, narrated video. One CLI for every step.
//
//   npm run lesson -- setup-voice                download the offline neural voice (Kokoro) into models/kokoro
//   npm run lesson -- new <slug>                 scaffold lessons/<slug>/article.md
//   npm run lesson -- plan <slug> [--minutes 10] [--offline]   article.md → script.json (Claude, or heuristic with --offline)
//   npm run lesson -- audio <slug>               script.json → narration audio + timing.json
//   npm run lesson -- prepare <slug>             select the lesson for the Remotion composition
//   npm run lesson -- preview <slug>             open Remotion Studio on the lesson
//   npm run lesson -- stills <slug> [n]          render n preview frames to out/<slug>/stills
//   npm run lesson -- render <slug>              render out/<slug>.mp4
//   npm run lesson -- build <slug> [--minutes 10] [--offline]  plan (if needed) + audio + prepare + render
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, CHROME, lessonDir, readArticle, readScript, writeJSON, prepare } from "./lib.mjs";
import { buildAudio } from "./audio.mjs";

const [, , cmd, slug, ...rest] = process.argv;
const flag = (name, dflt) => {
  const i = rest.indexOf(`--${name}`);
  if (i === -1) return dflt;
  const v = rest[i + 1];
  return v === undefined || v.startsWith("--") ? true : v;
};
const die = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};
const run = (bin, args, env = {}) => {
  const r = spawnSync(bin, args, { stdio: "inherit", cwd: ROOT, env: { ...process.env, ...env } });
  if (r.status !== 0) die(`${bin} ${args.join(" ")} failed`);
};
const npx = (args, env) => run(process.platform === "win32" ? "npx.cmd" : "npx", args, env);
const browserArgs = () => (existsSync(CHROME) ? [`--browser-executable=${CHROME}`] : []);

const commands = {
  "setup-voice"() {
    // Kokoro-82M (ONNX, quantized) + voice packs ship inside two MIT-licensed npm packages, so the registry is
    // the only network access needed. Python deps: pip install -r requirements.txt
    const dir = join(ROOT, "models/kokoro");
    const tmp = join(ROOT, ".tts-tmp/setup");
    mkdirSync(join(dir, "voices"), { recursive: true });
    mkdirSync(tmp, { recursive: true });
    for (const pkg of ["expo-kokoro@1.1.9", "kokoro-local-runtime@0.1.0"]) {
      console.log(`Fetching ${pkg} from npm…`);
      npx(["npm", "pack", pkg, "--pack-destination", tmp, "--silent"]);
    }
    run("tar", ["-xzf", join(tmp, "expo-kokoro-1.1.9.tgz"), "-C", tmp, "package/build/kokoro-quantized.onnx", "--wildcards", "package/build/voices/*.bin"]);
    run("tar", ["-xzf", join(tmp, "kokoro-local-runtime-0.1.0.tgz"), "-C", tmp, "--wildcards", "package/voices/*.bin"]);
    run("sh", ["-c", `mv -f "${tmp}/package/build/kokoro-quantized.onnx" "${dir}/" && cp "${tmp}/package/build/voices/"*.bin "${dir}/voices/" && cp "${tmp}/package/voices/"*.bin "${dir}/voices/"`]);
    run("python3", [join(ROOT, "scripts/tts/build_voices.py"), join(dir, "voices"), join(dir, "voices.npz")]);
    run("sh", ["-c", `rm -rf "${tmp}"`]);
    console.log(`\n✔ Kokoro ready in models/kokoro (voices: af_heart default; set TTS_VOICE to change).`);
  },

  new() {
    const dir = lessonDir(slug);
    if (existsSync(dir)) die(`${dir} already exists`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "article.md"),
      `# Your article title\n\nPaste the article here. Markdown headings (## Section) become chapters;\nbullet lists become bullet scenes; plain text works too.\n`,
    );
    console.log(`Created ${dir}/article.md — paste your article there, then:\n  npm run lesson -- build ${slug}`);
  },

  async plan() {
    const article = readArticle(slug);
    const minutes = parseFloat(flag("minutes", "10"));
    const source = flag("source", null);
    const out = join(lessonDir(slug), "script.json");
    if (existsSync(out) && !flag("force", false)) die(`${out} exists — pass --force to overwrite`);
    const hasKey = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
    let offline = !!flag("offline", false);
    if (!offline && !hasKey) {
      console.log("No ANTHROPIC_API_KEY found — using the offline heuristic planner (set a key for a much better script).");
      offline = true;
    }
    let lesson;
    if (offline) {
      const { planHeuristic } = await import("./planner/heuristic.mjs");
      lesson = planHeuristic(article, { targetMinutes: minutes, source });
      console.log(`Planned ${lesson.scenes.length} scenes with the offline heuristic planner.`);
    } else {
      const { planWithClaude } = await import("./planner/claude.mjs");
      console.log(`Asking Claude to plan ~${minutes} min from ${article.split(/\s+/).length} words…`);
      const r = await planWithClaude(article, { targetMinutes: minutes, source });
      lesson = r.lesson;
      console.log(`Planned ${lesson.scenes.length} scenes with ${r.model} (in ${r.usage.input_tokens} / out ${r.usage.output_tokens} tokens).`);
    }
    writeJSON(out, lesson);
    const words = lesson.scenes.reduce((a, s) => a + s.lines.reduce((b, l) => b + (l.speech ?? l.text).split(/\s+/).length, 0), 0);
    console.log(`Wrote ${out}  (${words} narration words ≈ ${(words / 140).toFixed(1)} min). Edit it freely, then: npm run lesson -- audio ${slug}`);
  },

  audio() {
    console.log(`Synthesising narration for ${slug}…`);
    buildAudio(slug);
  },

  prepare() {
    const { lesson, hasCustom } = prepare(slug);
    console.log(`Prepared "${lesson.title}" (${lesson.scenes.length} scenes${hasCustom ? ", custom scenes" : ""}).`);
  },

  preview() {
    commands.prepare();
    npx(["remotion", "studio", "src/index.ts", ...browserArgs()]);
  },

  async stills() {
    commands.prepare();
    const n = parseInt(rest[0] && !rest[0].startsWith("--") ? rest[0] : "8", 10);
    const { bundle } = await import("@remotion/bundler");
    const { renderStill, selectComposition } = await import("@remotion/renderer");
    const outDir = join(ROOT, "out", slug, "stills");
    mkdirSync(outDir, { recursive: true });
    const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.ts"), publicDir: join(ROOT, "public") });
    const browserExecutable = existsSync(CHROME) ? CHROME : undefined;
    const composition = await selectComposition({ serveUrl, id: "Lesson", browserExecutable });
    const gen = JSON.parse(readFileSync(join(ROOT, "src/generated/lesson.json"), "utf8"));
    // one frame per scene near its end (all elements visible), up to n scenes evenly spaced
    const scenes = gen.lesson.scenes;
    const count = Math.min(n, scenes.length);
    const wanted = new Set(Array.from({ length: count }, (_, i) => Math.round((i * (scenes.length - 1)) / Math.max(1, count - 1))));
    let cursor = 0;
    const picks = [];
    scenes.forEach((s, i) => {
      const t = gen.timing.scenes.find((x) => x.id === s.id);
      const frames = Math.round((0.6 + t.duration + 0.9) * 30);
      if (wanted.has(i)) picks.push({ id: s.id, frame: cursor + Math.floor(frames * 0.92) });
      cursor += frames;
    });
    for (const p of picks) {
      const output = join(outDir, `${p.id}.jpg`);
      await renderStill({ composition, serveUrl, output, frame: p.frame, imageFormat: "jpeg", jpegQuality: 85, browserExecutable, logLevel: "warn" });
      console.log("wrote", output);
    }
  },

  render() {
    commands.prepare();
    mkdirSync(join(ROOT, "out"), { recursive: true });
    const out = flag("out", join("out", `${slug}.mp4`));
    npx(["remotion", "render", "src/index.ts", "Lesson", out, "--codec", "h264", "--crf", flag("crf", "23"), "--concurrency", flag("concurrency", "4"), "--log=warn", ...browserArgs()]);
    console.log(`\n✔ ${out}`);
  },

  async build() {
    if (!existsSync(join(lessonDir(slug), "script.json"))) await commands.plan();
    else console.log(`Using existing ${slug}/script.json (delete it or run plan --force to re-plan).`);
    commands.audio();
    commands.render();
  },
};

if (!cmd || !commands[cmd] || (cmd !== "new" && cmd !== "setup-voice" && !slug)) {
  console.log(readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 13).join("\n").replace(/^\/\/ ?/gm, ""));
  process.exit(cmd ? 1 : 0);
}
if (cmd !== "new" && cmd !== "setup-voice" && !existsSync(lessonDir(slug))) die(`lessons/${slug} does not exist — run: npm run lesson -- new ${slug}`);
await commands[cmd]();
