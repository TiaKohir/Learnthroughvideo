import timing from "./content/timing.json";
import script from "./content/script.json";
import { FPS, LEAD, TAIL } from "./theme";

export type Line = { text: string; speech?: string };
export type ScenePlan = {
  id: string;
  index: number;
  chapter: string;
  from: number; // first frame in the composition
  frames: number; // duration in frames
  audio: string;
  audioDuration: number;
  lines: { text: string; start: number; end: number }[]; // seconds, relative to narration start
};

export const plan: ScenePlan[] = (() => {
  let cursor = 0;
  return script.scenes.map((s, index) => {
    const t = timing.scenes.find((x) => x.id === s.id);
    if (!t) throw new Error(`No timing for scene ${s.id}; run node scripts/build-audio.mjs`);
    const frames = Math.round((LEAD + t.duration + TAIL) * FPS);
    const p: ScenePlan = {
      id: s.id,
      index,
      chapter: s.chapter,
      from: cursor,
      frames,
      audio: t.audio,
      audioDuration: t.duration,
      lines: s.lines.map((l, i) => ({ text: l.text, start: t.lines[i].start, end: t.lines[i].end })),
    };
    cursor += frames;
    return p;
  });
})();

export const totalFrames = plan.reduce((a, p) => a + p.frames, 0);
export const chapters = Array.from(new Set(plan.map((p) => p.chapter)));
