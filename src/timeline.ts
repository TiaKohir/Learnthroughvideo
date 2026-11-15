import lessonJson from "./generated/lesson.json";
import { FPS, LEAD, TAIL } from "./theme";
import type { Lesson, Scene } from "./lesson/schema";

type Timing = { fps: number; scenes: { id: string; audio: string; duration: number; lines: { start: number; end: number }[] }[] };
type Generated = { slug: string; lesson: Lesson; timing: Timing };

export const generated = lessonJson as unknown as Generated;
export const lesson: Lesson = generated.lesson;

export type ScenePlan = {
  scene: Scene;
  id: string;
  index: number;
  chapter: string;
  from: number; // first frame in the composition
  frames: number; // duration in frames
  audio: string; // staticFile path
  audioDuration: number;
  lines: { text: string; start: number; end: number }[]; // seconds, relative to narration start
};

export const plan: ScenePlan[] = (() => {
  let cursor = 0;
  return lesson.scenes.map((s, index) => {
    const t = generated.timing.scenes.find((x) => x.id === s.id);
    if (!t) throw new Error(`No timing for scene ${s.id}; run: npm run lesson -- audio ${generated.slug}`);
    const frames = Math.round((LEAD + t.duration + TAIL) * FPS);
    const p: ScenePlan = {
      scene: s,
      id: s.id,
      index,
      chapter: s.chapter,
      from: cursor,
      frames,
      audio: t.audio,
      audioDuration: t.duration,
      lines: s.lines.map((l, i) => ({ text: l.text, start: t.lines[i]?.start ?? 0, end: t.lines[i]?.end ?? t.duration })),
    };
    cursor += frames;
    return p;
  });
})();

export const totalFrames = plan.reduce((a, p) => a + p.frames, 0);
export const chapters = Array.from(new Set(plan.map((p) => p.chapter)));
export const headerTitle = (lesson.shortTitle ?? lesson.title).toUpperCase();
