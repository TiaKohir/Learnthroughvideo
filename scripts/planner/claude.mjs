// Claude planner: asks Claude to turn an article into a lesson script that matches src/lesson/schema.ts.
// Needs credentials: ANTHROPIC_API_KEY (or an `ant auth login` profile). Exported: planWithClaude(articleText, opts).
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { LessonSchema, LAYOUTS } from "../../src/lesson/schema.ts";

const MODEL = process.env.PLANNER_MODEL || "claude-opus-5-5";

const SYSTEM = `You turn an article into the script of a narrated, animated explainer video.
You write for a learner who will hear the narration and see one animated scene per script entry.

Rules that matter most:
- Be faithful to the article. Do not add facts, numbers, names, dates or claims that are not in it. Keep its hedges ("approximately", "dated example", "illustrative", "not investment advice").
- Narration goes in "lines": each line is one or two spoken sentences (max ~35 words). 2–6 lines per scene. Written form in "text" (e.g. "$14.0T", "0.02%", "ETF"); in "speech" give the spoken form when it differs ("fourteen trillion dollars", "zero point zero two percent", "E T F"), otherwise null.
- Choose a layout per scene from: ${LAYOUTS.filter((l) => l !== "custom").join(", ")}. Vary layouts. Use "title" for the first scene, "takeaways" for a recap list, "closing" for the last scene. Use "stats" when the scene is about 1–4 numbers, "bars" for comparable magnitudes, "timeline" for dated events, "contrast" for things that must not be confused (A ≠ B), "compare" for two sides, "flow" for a sequence of steps, "chat" for quoted dialogue, "bullets" otherwise.
- Fill only the data fields that the chosen layout uses; set the rest to null. Give every item a "line" index (0-based) pointing at the narration line it should appear with, so visuals stay in sync with the voice.
- Scene "title" is a short headline (max ~55 characters, not a full sentence). "kicker" is a 1–3 word label. "chapter" groups adjacent scenes (reuse the article's section names).
- Scene ids are numbered kebab-case: 01-intro, 02-..., in order.
- Hit the requested running time: the narration should total about the requested number of words.`;

export const planWithClaude = async (articleText, opts = {}) => {
  const targetMinutes = opts.targetMinutes ?? 10;
  const wordsPerMinute = 140;
  const targetWords = Math.round(targetMinutes * wordsPerMinute);
  const client = new Anthropic();
  const user = `Target running time: ${targetMinutes} minutes (about ${targetWords} narration words, ${Math.round(targetMinutes * 2)}±4 scenes).
${opts.source ? `Attribution to use in the closing scene: ${opts.source}\n` : ""}
<article>
${articleText}
</article>`;

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: zodOutputFormat(LessonSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: user }],
  });
  stream.on("text", () => process.stderr.write("."));
  const message = await stream.finalMessage();
  process.stderr.write("\n");
  if (message.stop_reason === "refusal") throw new Error(`Planner refused: ${message.stop_details?.explanation ?? "no explanation"}`);
  if (message.stop_reason === "max_tokens") throw new Error("Planner output was cut off by max_tokens; try a shorter article or lower target minutes.");
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const lesson = LessonSchema.parse(JSON.parse(text));
  return { lesson, usage: message.usage, model: message.model };
};
