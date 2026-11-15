// Render preview stills: node scripts/stills.mjs "<id> <frame>" ...  (or reads out/frames.txt)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const chrome = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
const list = process.argv.length > 2 ? process.argv.slice(2) : readFileSync(path.join(root, "out/frames.txt"), "utf8").trim().split("\n");
mkdirSync(path.join(root, "out/stills"), { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const browserExecutable = existsSync(chrome) ? chrome : undefined;
const composition = await selectComposition({ serveUrl, id: "BigThree", browserExecutable });
for (const row of list) {
  const [id, f] = row.trim().split(/\s+/);
  const out = path.join(root, `out/stills/${id}-${f}.jpg`);
  await renderStill({ composition, serveUrl, output: out, frame: Number(f), imageFormat: "jpeg", jpegQuality: 85, browserExecutable, chromiumOptions: { gl: "angle" } });
  console.log("wrote", out);
}
