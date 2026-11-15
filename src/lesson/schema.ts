// Shared lesson schema: used by the planner (Node, type-stripped) and by the Remotion composition.
// Only erasable TypeScript syntax here (no enums) so Node can run it directly.
import { z } from "zod";

export const LAYOUTS = [
  "title",
  "bullets",
  "contrast",
  "compare",
  "stats",
  "timeline",
  "bars",
  "flow",
  "chat",
  "takeaways",
  "closing",
  "custom",
] as const;

const str = z.string();
const nstr = z.string().nullable();
const nnum = z.number().nullable();

export const LineSchema = z.object({
  text: str.describe("Subtitle text shown on screen (written form, e.g. $14.0T, 0.02%)."),
  speech: nstr.describe("Spoken form for text-to-speech when it differs (numbers in words, acronyms spelled). null = same as text."),
});

export const ItemSchema = z.object({
  text: str,
  note: nstr.describe("Optional smaller secondary text."),
  line: nnum.describe("Index of the narration line this item should appear with. null = automatic."),
});

export const SceneDataSchema = z.object({
  title: nstr.describe("Scene headline (max ~55 characters)."),
  kicker: nstr.describe("Small uppercase label above the title."),
  subtitle: nstr,
  chips: z.array(str).nullable().describe("Short tags (title/closing layouts)."),
  items: z.array(ItemSchema).nullable().describe("bullets / takeaways: 3-6 items."),
  icon: z.enum(["check", "cross", "dot", "number"]).nullable().describe("bullets: icon style."),
  left: z.object({ heading: str, items: z.array(str), color: z.enum(["teal", "amber", "rose", "blue", "violet", "green"]).nullable() }).nullable(),
  right: z.object({ heading: str, items: z.array(str), color: z.enum(["teal", "amber", "rose", "blue", "violet", "green"]).nullable() }).nullable(),
  verdict: nstr.describe("compare: one-line conclusion shown under the two columns."),
  pairs: z.array(z.object({ a: str, b: str, note: nstr, line: nnum })).nullable().describe("contrast: things that must not be confused (A ≠ B)."),
  stats: z
    .array(z.object({ label: str, value: z.number(), prefix: nstr, suffix: nstr, decimals: nnum, note: nstr, line: nnum }))
    .nullable()
    .describe("stats: 1-4 big numbers."),
  footnote: nstr,
  events: z.array(z.object({ when: str, what: str, line: nnum })).nullable().describe("timeline: 2-5 dated events."),
  bars: z.array(z.object({ label: str, value: z.number(), display: nstr, line: nnum })).nullable().describe("bars: 2-5 horizontal bars; display = formatted value."),
  unit: nstr,
  steps: z.array(z.object({ label: str, note: nstr, line: nnum })).nullable().describe("flow: 3-5 steps joined by arrows."),
  messages: z.array(z.object({ who: str, text: str, side: z.enum(["left", "right"]), line: nnum })).nullable().describe("chat: 2-4 bubbles."),
  points: z.array(str).nullable(),
  attribution: nstr,
  disclaimer: nstr,
  note: nstr.describe("Italic caption under the main visual."),
});

export const SceneSchema = z.object({
  id: str.describe("kebab-case, numbered, e.g. 03-what-it-means"),
  chapter: str.describe("Section name shown in the chapter track; reuse across adjacent scenes."),
  layout: z.enum(LAYOUTS),
  lines: z.array(LineSchema).min(1).describe("Narration, one sentence or two per line; 2-6 lines per scene."),
  data: SceneDataSchema,
});

export const LessonSchema = z.object({
  title: str,
  shortTitle: nstr.describe("Max ~20 characters; shown in the header."),
  subtitle: nstr,
  source: nstr.describe("Attribution for the source article."),
  scenes: z.array(SceneSchema).min(3),
});

export type Line = z.infer<typeof LineSchema>;
export type SceneData = z.infer<typeof SceneDataSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Layout = (typeof LAYOUTS)[number];

/** Recursively fill missing nullable fields with null, so hand-written scripts can omit them. */
const fill = (schema: any, value: any): any => {
  const def = schema?.def ?? schema?._def;
  const type = def?.type;
  if (type === "nullable") return value == null ? null : fill(def.innerType, value);
  if (type === "object") {
    const shape = def.shape ?? schema.shape;
    const src = value && typeof value === "object" ? value : {};
    const out: any = {};
    for (const k of Object.keys(shape)) out[k] = fill(shape[k], src[k]);
    return out;
  }
  if (type === "array") return Array.isArray(value) ? value.map((v) => fill(def.element, v)) : value;
  return value;
};

/** Accepts the relaxed hand-written form (strings for lines/items, omitted fields) and returns a validated Lesson. */
export const normalizeLesson = (raw: unknown): Lesson => {
  const r = (raw ?? {}) as any;
  const scenes = (r.scenes ?? []).map((s: any) => ({
    ...s,
    chapter: s.chapter ?? "",
    layout: s.layout ?? "bullets",
    lines: (s.lines ?? []).map((l: any) => (typeof l === "string" ? { text: l } : l)),
    data: {
      ...(s.data ?? {}),
      items: Array.isArray(s.data?.items) ? s.data.items.map((it: any) => (typeof it === "string" ? { text: it } : it)) : s.data?.items,
    },
  }));
  return LessonSchema.parse(fill(LessonSchema, { ...r, scenes }));
};
