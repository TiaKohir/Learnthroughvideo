// Offline planner: turns an article (markdown or plain text) into a lesson script without any API.
// It is deliberately simple — the Claude planner (scripts/planner/claude.mjs) produces much better scripts.
// Exported: planHeuristic(articleText, { title, targetMinutes }) -> lesson object (relaxed form; normalizeLesson validates it).

const WORDS_PER_MINUTE = 140;

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "scene";

const ABBR = /\b(U\.S|U\.K|e\.g|i\.e|etc|vs|Inc|Ltd|Corp|Co|No|Mr|Ms|Mrs|Dr|St|Jr|Sr|approx)\./g;
const sentences = (text) => {
  const protectedText = text
    .replace(/\s+/g, " ")
    .replace(ABBR, (m) => m.replace(/\./g, "~"))
    .replace(/(\d)\.(\d)/g, "$1~$2"); // decimals
  return protectedText
    .split(/(?<=[.!?]["”)]?)\s+(?=[A-Z0-9“"(])/)
    .map((x) => x.replace(/~/g, ".").trim())
    .filter(Boolean);
};

const words = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;
const asLine = (l) => (typeof l === "string" ? { text: l, speech: null } : l);

/** Parse markdown-ish text into {title, byline, sections:[{heading, paragraphs:[{text, list?}]}]}. */
export const parseArticle = (raw) => {
  const lines = raw.replace(/\r/g, "").split("\n");
  let title = null;
  const sections = [];
  let current = { heading: "Introduction", blocks: [] };
  let para = [];
  const flushPara = () => {
    if (para.length) {
      current.blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  const isHeading = (line, next) => {
    if (/^#{1,6}\s/.test(line)) return true;
    // plain-text heading: short line, Title-ish, no terminal punctuation, followed by a paragraph line
    const t = line.trim();
    return t.length > 0 && t.length <= 70 && !/[.!?:;,]$/.test(t) && words(t) <= 10 && next && next.trim().length > 90 && /^[A-Z“"]/.test(t);
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      flushPara();
      continue;
    }
    if (/^#\s/.test(t) && !title) {
      title = t.replace(/^#\s*/, "");
      continue;
    }
    if (isHeading(t, lines[i + 1] ?? lines[i + 2])) {
      flushPara();
      if (current.blocks.length) sections.push(current);
      current = { heading: t.replace(/^#+\s*/, "").replace(/^["“]|["”]$/g, ""), blocks: [] };
      continue;
    }
    if (/^([-*•]|\d+[.)])\s+/.test(t)) {
      flushPara();
      const item = t.replace(/^([-*•]|\d+[.)])\s+/, "");
      const last = current.blocks[current.blocks.length - 1];
      if (last && last.type === "list") last.items.push(item);
      else current.blocks.push({ type: "list", items: [item] });
      continue;
    }
    para.push(t);
  }
  flushPara();
  if (current.blocks.length) sections.push(current);
  // drop byline / metadata paragraphs
  for (const sec of sections) sec.blocks = sec.blocks.filter((b) => !(b.type === "p" && words(b.text) < 45 && (/\b(published|updated|min read|data as of)\b/i.test(b.text) || /^by [A-Z]/.test(b.text))));
  if (!title) {
    // first short line of the document
    const first = lines.map((l) => l.trim()).find((l) => l && l.length < 90);
    title = first ?? "Lesson";
    if (sections[0]?.blocks[0]?.type === "p" && sections[0].blocks[0].text.startsWith(title)) sections[0].blocks.shift();
  }
  for (const sec of sections) {
    const merged = [];
    for (const b of sec.blocks) {
      const last = merged[merged.length - 1];
      if (b.type === "p" && last?.type === "p" && /^["“]/.test(b.text) && /^["“]/.test(last.text)) last.text += " " + b.text;
      else merged.push({ ...b });
    }
    sec.blocks = merged;
  }
  return { title, sections: sections.filter((s) => s.blocks.length) };
};

const NUM_RE = /(\$\s?\d[\d,]*(?:\.\d+)?\s?(?:trillion|billion|million|[TBMK])?|\d[\d,]*(?:\.\d+)?\s?%|\b\d[\d,]*(?:\.\d+)?\s(?:trillion|billion|million)\b)/gi;

const parseNumber = (s) => {
  const m = s.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  let value = parseFloat(m[0]);
  const prefix = s.trim().startsWith("$") ? "$" : "";
  let suffix = "";
  if (/%/.test(s)) suffix = "%";
  else if (/trillion|\bT\b/i.test(s)) suffix = "T";
  else if (/billion|\bB\b/i.test(s)) suffix = "B";
  else if (/million|\bM\b/i.test(s)) suffix = "M";
  const decimals = (m[0].split(".")[1] ?? "").length;
  return { value, prefix, suffix, decimals: Math.min(decimals, 4) };
};

const keyPhrase = (sentence, maxWords = 16) => {
  const cleaned = sentence
    .replace(/^(so|but|and|however|therefore|for example|for a dated example|in short),?\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  if (words(cleaned) <= maxWords) return cleaned;
  const clause = cleaned.split(/[,;:—–(]/)[0].trim();
  if (words(clause) >= 5 && words(clause) <= maxWords) return clause;
  return cleaned.split(/\s+/).slice(0, Math.min(12, maxWords)).join(" ") + "…";
};

/** Label for a number: the words right after it (e.g. "$14.0 trillion in AUM at year-end 2025"). */
const numberLabel = (sentence, raw) => {
  const idx = sentence.indexOf(raw);
  const after = sentence.slice(idx + raw.length).replace(/^[\s,;:]+/, "").split(/[,;]|\.(?=\s|$)/)[0];
  const w = after.split(/\s+/).filter(Boolean).slice(0, 6).join(" ");
  if (words(w) >= 2) return w;
  const before = sentence.slice(0, idx).trim().split(/\s+/).slice(-6).join(" ");
  return before || keyPhrase(sentence, 8);
};

const spoken = (text) => text; // the audio step applies acronym/number substitutions

const shortTitle = (heading) => {
  if (heading.length <= 55) return heading;
  const head = heading.split(/[:—–]/)[0].trim();
  return head.length >= 12 ? head : heading.slice(0, 52).trim() + "…";
};

export const planHeuristic = (articleText, opts = {}) => {
  const targetMinutes = opts.targetMinutes ?? 10;
  const { title, sections } = parseArticle(articleText);
  const budget = targetMinutes * WORDS_PER_MINUTE;
  const scenes = [];
  let n = 0;
  const id = (name) => `${String(++n).padStart(2, "0")}-${slug(name)}`;

  // Title scene
  const firstPara = sections[0]?.blocks.find((b) => b.type === "p")?.text ?? "";
  const hook = sentences(firstPara).slice(0, 2);
  scenes.push({
    id: id("intro"),
    chapter: "Introduction",
    layout: "title",
    lines: [`${title}.`, ...hook].map(asLine),
    data: { title, kicker: "Lesson", subtitle: hook[0] ?? null, chips: sections.slice(1, 7).map((s) => shortTitle(s.heading)).filter((h) => h.length <= 30).slice(0, 5) },
  });

  // Section scenes
  for (const sec of sections) {
    const heading = sec.heading;
    const isTakeaways = /takeaway|summary|key points|recap/i.test(heading);
    const isClosing = sec === sections[sections.length - 1] && !isTakeaways;
    for (const block of sec.blocks) {
      if (block.type === "list") {
        scenes.push({
          id: id(heading),
          chapter: heading,
          layout: isTakeaways ? "takeaways" : "bullets",
          lines: [isTakeaways ? `${heading}.` : `${heading}: the key points.`, ...block.items.map((it) => (/[.!?]$/.test(it) ? it : it + "."))].map(asLine),
          data: { title: shortTitle(heading), items: block.items.map((text, i) => ({ text: text.replace(/[.]$/, ""), line: i + 1 })) },
        });
        continue;
      }
      const sents = sentences(block.text);
      if (!sents.length) continue;
      // chunk into scenes of <= 4 sentences / <= 80 words
      const chunks = [];
      let cur = [];
      let w = 0;
      for (const s of sents) {
        if (cur.length && (cur.length >= 4 || w + words(s) > 85)) {
          chunks.push(cur);
          cur = [];
          w = 0;
        }
        cur.push(s);
        w += words(s);
      }
      if (cur.length) chunks.push(cur);
      if (chunks.length > 1 && chunks[chunks.length - 1].length === 1 && chunks[chunks.length - 2].length <= 4) chunks[chunks.length - 2].push(...chunks.pop());
      for (const chunk of chunks) {
        const text = chunk.join(" ");
        const quotes = chunk.filter((s) => /^["“]/.test(s));
        const nums = [...new Set(text.match(NUM_RE) ?? [])];
        const years = [...new Set(text.match(/\b(19|20)\d{2}\b/g) ?? [])];
        let layout = "bullets";
        let data = { title: shortTitle(heading), items: chunk.map((s, i) => ({ text: keyPhrase(s), line: i })) };
        if (quotes.length >= 2) {
          layout = "chat";
          data = { title: shortTitle(heading), messages: quotes.slice(0, 4).map((q, i) => ({ who: i % 2 === 0 ? "Client" : "Advisor", text: q.replace(/^["“]|["”]$/g, ""), side: i % 2 === 0 ? "left" : "right", line: chunk.indexOf(q) })) };
        } else if (nums.length >= 2 && nums.length <= 4) {
          layout = "stats";
          const seen = new Set();
          data = {
            title: shortTitle(heading),
            stats: nums
              .map((raw) => ({ raw, p: parseNumber(raw), sIdx: chunk.findIndex((x) => x.includes(raw)) }))
              .filter(({ p }) => p && !seen.has(p.value + (p.suffix ?? "")) && seen.add(p.value + (p.suffix ?? "")))
              .slice(0, 4)
              .map(({ raw, p, sIdx }) => ({ label: numberLabel(chunk[Math.max(0, sIdx)], raw), value: p.value, prefix: p.prefix || null, suffix: p.suffix || null, decimals: p.decimals, note: null, line: Math.max(0, sIdx) })),
            footnote: "Figures as stated in the source article; verify against primary sources.",
          };
        } else if (years.length >= 2) {
          layout = "timeline";
          data = {
            title: shortTitle(heading),
            events: years.slice(0, 5).map((y) => {
              const sIdx = chunk.findIndex((s) => s.includes(y));
              return { when: y, what: keyPhrase(chunk[Math.max(0, sIdx)], 22), line: Math.max(0, sIdx) };
            }),
          };
        } else if (isClosing) {
          layout = "closing";
          data = { title: shortTitle(heading), points: chunk.map(keyPhrase), attribution: opts.source ?? null, disclaimer: "Summarized from the source article. Verify details against primary sources." };
        }
        scenes.push({ id: id(heading), chapter: heading, layout, lines: chunk.map((s) => ({ text: s, speech: spoken(s) === s ? null : spoken(s) })), data });
      }
    }
  }

  // Trim to the word budget by dropping the longest middle scenes' trailing lines (keeps intro/closing intact)
  const total = () => scenes.reduce((a, s) => a + s.lines.reduce((b, l) => b + words(l.text), 0), 0);
  let guard = 0;
  while (total() > budget * 1.15 && guard++ < 200) {
    const middle = scenes.slice(1, -1).filter((s) => s.lines.length > 2);
    if (!middle.length) break;
    const longest = middle.sort((a, b) => b.lines.length - a.lines.length)[0];
    longest.lines.pop();
    if (longest.data?.items) longest.data.items = longest.data.items.filter((it) => (it.line ?? 0) < longest.lines.length);
  }

  return {
    title,
    shortTitle: title.length <= 22 ? title : title.split(/[:—–-]/)[0].trim().slice(0, 22),
    subtitle: null,
    source: opts.source ?? null,
    scenes,
  };
};
