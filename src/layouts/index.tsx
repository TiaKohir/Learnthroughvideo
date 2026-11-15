import React from "react";
import { interpolate, Easing } from "remotion";
import { C, MONO } from "../theme";
import type { Scene, SceneData } from "../lesson/schema";
import { Appear, Body, Bullets, Card, Check, Chip, Col, Counter, Cross, Neq, Note, Row, Title, useScene } from "../components/core";

const PALETTE: Record<string, string> = { teal: C.teal, amber: C.amber, rose: C.rose, blue: C.blue, violet: C.violet, green: C.green };
const ORDER = [C.teal, C.amber, C.blue, C.violet, C.rose, C.green];
const color = (name: string | null | undefined, i = 0) => (name && PALETTE[name]) || ORDER[i % ORDER.length];

/** Time at which item i (of n) should appear, synced to narration lines. */
const useItemTimes = (n: number, explicit: (number | null | undefined)[] = []) => {
  const { L, plan } = useScene();
  const lines = plan.lines.length;
  return Array.from({ length: n }, (_, i) => {
    const ex = explicit[i];
    if (typeof ex === "number") return L(Math.max(0, Math.min(ex, lines - 1))) + 0.15;
    if (lines >= n + 1) return L(i + 1) + 0.15; // one item per line after the intro line
    const per = Math.max(1, Math.ceil(n / Math.max(1, lines)));
    const li = Math.min(lines - 1, Math.floor(i / per));
    return L(li) + 0.2 + (i % per) * 0.55;
  });
};

const Head: React.FC<{ d: SceneData; fallback: string }> = ({ d, fallback }) => (
  <Title kicker={d.kicker ?? undefined}>{d.title ?? fallback}</Title>
);

/* ---------- title ---------- */
const TitleLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const chips = d.chips ?? [];
  const t = useItemTimes(chips.length);
  return (
    <Body style={{ top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <Appear at={-0.3} dir="down">
        <div style={{ textAlign: "center" }}>
          {d.kicker && <div style={{ color: C.teal, fontSize: 26, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", marginBottom: 14 }}>{d.kicker}</div>}
          <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, maxWidth: 1500 }}>{d.title ?? s.chapter}</div>
        </div>
      </Appear>
      {d.subtitle && (
        <Appear at={0.4}>
          <div style={{ fontSize: 34, color: C.muted, textAlign: "center", maxWidth: 1300, lineHeight: 1.35 }}>{d.subtitle}</div>
        </Appear>
      )}
      {chips.length > 0 && (
        <Row gap={16} style={{ flexWrap: "wrap", maxWidth: 1500 }}>
          {chips.map((c, i) => (
            <Appear key={c} at={t[i]} dir="up" dist={14}>
              <Chip>{c}</Chip>
            </Appear>
          ))}
        </Row>
      )}
      {d.note && (
        <Appear at={t[t.length - 1] ?? 1.5} dir="none">
          <Note>{d.note}</Note>
        </Appear>
      )}
    </Body>
  );
};

/* ---------- bullets ---------- */
const BulletsLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const items = d.items ?? [];
  const t = useItemTimes(items.length, items.map((i) => i.line));
  const numbered = d.icon === "number";
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body>
        <Col gap={items.length > 4 ? 18 : 28} style={{ maxWidth: 1500 }}>
          {items.map((it, i) => (
            <Appear key={i} at={t[i]} dir="left" dist={20}>
              <Row gap={22} justify="flex-start" align="flex-start">
                {numbered ? (
                  <div style={{ width: 60, height: 60, borderRadius: 30, flex: "none", background: `${C.teal}22`, border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 28, fontWeight: 800, color: C.teal }}>{i + 1}</div>
                ) : (
                  <div style={{ flex: "none", marginTop: 4 }}>
                    {d.icon === "cross" ? <Cross size={36} /> : d.icon === "dot" ? <div style={{ width: 14, height: 14, borderRadius: 7, background: C.teal, margin: "12px 11px" }} /> : <Check size={36} />}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: items.length > 4 ? 30 : 34, fontWeight: 600, lineHeight: 1.25 }}>{it.text}</div>
                  {it.note && <div style={{ fontSize: 24, color: C.muted, marginTop: 6 }}>{it.note}</div>}
                </div>
              </Row>
            </Appear>
          ))}
        </Col>
        {d.note && (
          <Appear at={t[t.length - 1] + 1.2} style={{ marginTop: 36 }}>
            <Note>{d.note}</Note>
          </Appear>
        )}
      </Body>
    </>
  );
};

/* ---------- contrast (A ≠ B) ---------- */
const ContrastLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const pairs = d.pairs ?? [];
  const t = useItemTimes(pairs.length, pairs.map((p) => p.line));
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body>
        <Col gap={26}>
          {pairs.map((p, i) => (
            <Appear key={i} at={t[i]} dir="up">
              <Card pad={22} accent={ORDER[i % ORDER.length]}>
                <Row gap={18} justify="flex-start" style={{ flexWrap: "wrap" }}>
                  <Chip big color={ORDER[i % ORDER.length]}>{p.a}</Chip>
                  <Neq size={50} />
                  <Chip big color={C.dim}>{p.b}</Chip>
                  {p.note && <div style={{ color: C.muted, fontSize: 24, marginLeft: 10, flex: 1, minWidth: 300 }}>{p.note}</div>}
                </Row>
              </Card>
            </Appear>
          ))}
        </Col>
        {d.note && (
          <Appear at={t[t.length - 1] + 1.2} style={{ marginTop: 30 }}>
            <Note>{d.note}</Note>
          </Appear>
        )}
      </Body>
    </>
  );
};

/* ---------- compare (two columns) ---------- */
const CompareLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const { L, plan } = useScene();
  const left = d.left ?? { heading: "", items: [], color: null };
  const right = d.right ?? { heading: "", items: [], color: null };
  const n = plan.lines.length;
  const tl = L(Math.min(1, n - 1)) + 0.1;
  const tr = L(Math.min(2, n - 1)) + 0.1;
  const tv = L(n - 1) + 0.3;
  const cols: { h: string; items: string[]; c: string; at: number; icon: "check" | "cross" | "dot" }[] = [
    { h: left.heading, items: left.items, c: color(left.color, 0), at: tl, icon: left.color === "rose" ? "cross" : "check" },
    { h: right.heading, items: right.items, c: color(right.color, 4), at: tr, icon: right.color === "rose" || !right.color ? "cross" : "check" },
  ];
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body>
        <Row gap={40} align="stretch">
          {cols.map((col, i) => (
            <Appear key={i} at={col.at} dir={i === 0 ? "left" : "right"} style={{ flex: 1 }}>
              <Card accent={col.c} style={{ height: "100%", minHeight: 380 }}>
                <div style={{ color: col.c, fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>{col.h}</div>
                <Bullets at={col.at + 0.3} step={0.45} icon={col.icon} size={28} color={col.c} items={col.items} />
              </Card>
            </Appear>
          ))}
        </Row>
        {d.verdict && (
          <Appear at={tv} style={{ marginTop: 34 }}>
            <Card pad={20} accent={C.amber} style={{ fontSize: 30, fontWeight: 700, textAlign: "center" }}>{d.verdict}</Card>
          </Appear>
        )}
      </Body>
    </>
  );
};

/* ---------- stats ---------- */
const StatsLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const stats = (d.stats ?? []).slice(0, 4);
  const t = useItemTimes(stats.length, stats.map((x) => x.line));
  const big = stats.length <= 2;
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body>
        <Row gap={30} align="stretch" style={{ flexWrap: "wrap" }}>
          {stats.map((st, i) => (
            <Appear key={i} at={t[i]} dir="up" style={{ flex: `1 1 ${big ? 45 : 22}%`, minWidth: 380 }}>
              <Card accent={ORDER[(i + 1) % ORDER.length]} style={{ height: big ? 300 : 260 }}>
                <div style={{ color: C.muted, fontSize: 24, fontWeight: 600, letterSpacing: 1 }}>{st.label}</div>
                <div style={{ fontSize: big ? 96 : 72, fontWeight: 900, letterSpacing: -2, marginTop: 10 }}>
                  <Counter at={t[i] + 0.2} to={st.value} decimals={st.decimals ?? 0} prefix={st.prefix ?? ""} suffix={st.suffix ?? ""} dur={1.5} />
                </div>
                {st.note && <div style={{ color: C.muted, fontSize: 23, marginTop: 8 }}>{st.note}</div>}
              </Card>
            </Appear>
          ))}
        </Row>
        {(d.footnote || d.note) && (
          <Appear at={t[t.length - 1] + 1.4} style={{ marginTop: 34 }}>
            <Card pad={20} accent={C.dim}>
              <Note>{d.footnote ?? d.note}</Note>
            </Card>
          </Appear>
        )}
      </Body>
    </>
  );
};

/* ---------- timeline ---------- */
const TimelineLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const events = (d.events ?? []).slice(0, 5);
  const t = useItemTimes(events.length, events.map((e) => e.line));
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body>
        <Col gap={0} style={{ maxWidth: 1500 }}>
          {events.map((e, i) => (
            <Appear key={i} at={t[i]} dir="left">
              <Row gap={24} justify="flex-start" align="stretch">
                <div style={{ width: 220, fontFamily: MONO, fontSize: 32, fontWeight: 800, color: ORDER[i % ORDER.length], paddingTop: 16, textAlign: "right" }}>{e.when}</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: ORDER[i % ORDER.length], marginTop: 22 }} />
                  {i < events.length - 1 && <div style={{ width: 3, flex: 1, background: C.line }} />}
                </div>
                <Card pad={20} style={{ flex: 1, marginBottom: 20, fontSize: 28, fontWeight: 600 }}>{e.what}</Card>
              </Row>
            </Appear>
          ))}
        </Col>
        {d.note && (
          <Appear at={t[t.length - 1] + 1.2}>
            <Note>{d.note}</Note>
          </Appear>
        )}
      </Body>
    </>
  );
};

/* ---------- bars ---------- */
const BarsLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const { t: now } = useScene();
  const bars = (d.bars ?? []).slice(0, 6);
  const t = useItemTimes(bars.length, bars.map((b) => b.line));
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1e-9);
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body>
        {d.unit && <div style={{ color: C.muted, fontSize: 24, marginBottom: 20 }}>{d.unit}</div>}
        <Col gap={28}>
          {bars.map((b, i) => {
            const w = interpolate(now, [t[i], t[i] + 1.3], [0, (Math.abs(b.value) / max) * 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (
              <Appear key={i} at={t[i] - 0.2} dir="left">
                <Row gap={22} justify="flex-start">
                  <div style={{ width: 330, fontSize: 28, fontWeight: 700, textAlign: "right" }}>{b.label}</div>
                  <div style={{ width: 1000, height: 60, background: "rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ width: w, height: "100%", background: `linear-gradient(90deg, ${ORDER[i % ORDER.length]}88, ${ORDER[i % ORDER.length]})` }} />
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, fontFamily: MONO, minWidth: 200 }}>{b.display ?? b.value.toLocaleString("en-US")}</div>
                </Row>
              </Appear>
            );
          })}
        </Col>
        {d.note && (
          <Appear at={t[t.length - 1] + 1.4} style={{ marginTop: 34 }}>
            <Card pad={20} accent={C.dim}>
              <Note>{d.note}</Note>
            </Card>
          </Appear>
        )}
      </Body>
    </>
  );
};

/* ---------- flow ---------- */
const FlowLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const steps = (d.steps ?? []).slice(0, 5);
  const t = useItemTimes(steps.length, steps.map((x) => x.line));
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Row gap={0} align="stretch">
          {steps.map((st, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <Appear at={t[i] - 0.1} dir="pop" style={{ display: "flex", alignItems: "center", padding: "0 14px" }}>
                  <div style={{ fontSize: 48, color: C.teal }}>→</div>
                </Appear>
              )}
              <Appear at={t[i]} dir="up" style={{ flex: 1 }}>
                <Card accent={ORDER[i % ORDER.length]} style={{ minHeight: 220, height: "100%" }}>
                  <div style={{ fontFamily: MONO, color: ORDER[i % ORDER.length], fontSize: 22, fontWeight: 800, marginBottom: 10 }}>STEP {i + 1}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>{st.label}</div>
                  {st.note && <div style={{ fontSize: 23, color: C.muted, marginTop: 10 }}>{st.note}</div>}
                </Card>
              </Appear>
            </React.Fragment>
          ))}
        </Row>
        {d.note && (
          <Appear at={t[t.length - 1] + 1.2} style={{ marginTop: 40 }}>
            <Note style={{ textAlign: "center" }}>{d.note}</Note>
          </Appear>
        )}
      </Body>
    </>
  );
};

/* ---------- chat ---------- */
const ChatLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const msgs = (d.messages ?? []).slice(0, 4);
  const t = useItemTimes(msgs.length, msgs.map((m) => m.line));
  return (
    <>
      <Head d={d} fallback={s.chapter} />
      <Body>
        <Col gap={34}>
          {msgs.map((m, i) => {
            const right = m.side === "right";
            const col = right ? C.teal : C.muted;
            return (
              <Appear key={i} at={t[i]} dir={right ? "right" : "left"}>
                <div style={{ display: "flex", justifyContent: right ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: 1150 }}>
                    <div style={{ color: col, fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textAlign: right ? "right" : "left", textTransform: "uppercase" }}>{m.who}</div>
                    <div style={{ background: right ? `${C.teal}26` : "#1B2A47", border: `1.5px solid ${right ? C.teal : C.line}`, borderRadius: right ? "24px 6px 24px 24px" : "6px 24px 24px 24px", padding: "22px 30px", fontSize: 31, lineHeight: 1.35 }}>{m.text}</div>
                  </div>
                </div>
              </Appear>
            );
          })}
        </Col>
      </Body>
    </>
  );
};

/* ---------- takeaways ---------- */
const TakeawaysLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const items = (d.items ?? []).map((i) => i.text).concat(d.points ?? []);
  const t = useItemTimes(items.length, (d.items ?? []).map((i) => i.line));
  return (
    <>
      <Head d={d} fallback="Key takeaways" />
      <Body>
        <Col gap={items.length > 5 ? 14 : 22}>
          {items.map((it, i) => (
            <Appear key={i} at={t[i] - 0.2} dir="left">
              <Row gap={22} justify="flex-start">
                <div style={{ width: 64, height: 64, borderRadius: 32, flex: "none", background: `${C.teal}22`, border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 30, fontWeight: 800, color: C.teal }}>{i + 1}</div>
                <div style={{ fontSize: items.length > 5 ? 30 : 33, fontWeight: 600, lineHeight: 1.25 }}>{it}</div>
              </Row>
            </Appear>
          ))}
        </Col>
      </Body>
    </>
  );
};

/* ---------- closing ---------- */
const ClosingLayout: React.FC<{ s: Scene }> = ({ s }) => {
  const d = s.data;
  const { L, plan } = useScene();
  const points = d.points ?? (d.items ?? []).map((i) => i.text);
  const n = plan.lines.length;
  return (
    <>
      <Head d={d} fallback="Closing" />
      <Body>
        <Row gap={50} align="flex-start">
          <Appear at={L(0) + 0.2} style={{ flex: 1 }}>
            <Card accent={C.teal} style={{ minHeight: 300 }}>
              {d.subtitle && <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 20 }}>{d.subtitle}</div>}
              <Bullets at={L(Math.min(1, n - 1)) + 0.3} step={0.8} size={27} items={points} />
            </Card>
          </Appear>
          <Col gap={24} style={{ flex: 1 }}>
            {(d.chips ?? []).length > 0 && (
              <Appear at={L(Math.min(2, n - 1)) + 0.2}>
                <Row gap={14} style={{ flexWrap: "wrap" }}>
                  {(d.chips ?? []).map((c, i) => (
                    <Chip key={c} big color={ORDER[i % ORDER.length]}>{c}</Chip>
                  ))}
                </Row>
              </Appear>
            )}
            {(d.attribution || d.disclaimer) && (
              <Appear at={L(n - 1) + 0.2}>
                <Card pad={22} accent={C.dim}>
                  <div style={{ color: C.muted, fontSize: 22, lineHeight: 1.45 }}>
                    {d.attribution}
                    {d.attribution && d.disclaimer ? " " : ""}
                    {d.disclaimer}
                  </div>
                </Card>
              </Appear>
            )}
          </Col>
        </Row>
      </Body>
    </>
  );
};

export const LAYOUT_COMPONENTS: Record<string, React.FC<{ s: Scene }>> = {
  title: TitleLayout,
  bullets: BulletsLayout,
  contrast: ContrastLayout,
  compare: CompareLayout,
  stats: StatsLayout,
  timeline: TimelineLayout,
  bars: BarsLayout,
  flow: FlowLayout,
  chat: ChatLayout,
  takeaways: TakeawaysLayout,
  closing: ClosingLayout,
};
