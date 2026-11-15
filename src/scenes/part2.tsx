import React from "react";
import { interpolate, Easing } from "remotion";
import { C, MONO, SPONSOR } from "../theme";
import { Appear, Body, Bullets, Card, Chip, Col, Counter, Neq, Note, Row, Stamp, Title, Wordmark, useScene, useSpringAt } from "../components/core";

const S = SPONSOR;

/* 08 — Vanguard ownership */
export const Vanguard: React.FC = () => {
  const { L } = useScene();
  const p = useSpringAt(L(1) + 0.3, { damping: 22 });
  const nodes = [
    { n: "Fund shareholders", c: C.green, x: 310, y: 60 },
    { n: "Vanguard funds", c: S.vanguard.color, x: 560, y: 330 },
    { n: "Vanguard (the manager)", c: C.amber, x: 60, y: 330 },
  ];
  const dash = interpolate(p, [0, 1], [600, 0]);
  return (
    <>
      <Title kicker="Vanguard">An investor-owned structure — and what it does not prove</Title>
      <Body>
        <Row gap={50} align="flex-start">
          <Appear at={L(1) + 0.1} style={{ flex: 1 }}>
            <Card style={{ height: 500, position: "relative" }}>
              <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3 }}>U.S. OWNERSHIP CHAIN</div>
              <svg width="760" height="420" style={{ position: "absolute", left: 20, top: 50 }}>
                <defs>
                  <marker id="arr" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto">
                    <path d="M0,0 L12,6 L0,12 z" fill={C.teal} />
                  </marker>
                </defs>
                {[
                  "M 460 118 L 660 312",
                  "M 530 352 L 418 352",
                  "M 215 312 L 405 118",
                ].map((d, i) => (
                  <path key={i} d={d} stroke={C.teal} strokeWidth="4" fill="none" markerEnd="url(#arr)" strokeDasharray={600} strokeDashoffset={dash} />
                ))}
                {[
                  { t: "own", x: 590, y: 205 },
                  { t: "own", x: 450, y: 395 },
                  { t: "serves", x: 250, y: 205 },
                ].map((l) => (
                  <text key={l.t + l.x} x={l.x} y={l.y} fill={C.muted} fontSize="22" fontWeight="600" fontFamily="Inter" opacity={p}>
                    {l.t}
                  </text>
                ))}
              </svg>
              {nodes.map((nd, i) => (
                <Appear key={nd.n} at={L(1) + 0.2 + i * 0.3} dir="pop" style={{ position: "absolute", left: nd.x, top: nd.y + 40 }}>
                  <div style={{ background: `${nd.c}22`, border: `2px solid ${nd.c}`, borderRadius: 14, padding: "14px 22px", fontSize: 26, fontWeight: 800, whiteSpace: "nowrap" }}>
                    {nd.n}
                  </div>
                </Appear>
              ))}
              <Appear at={L(1) + 2.6} style={{ position: "absolute", top: 20, right: 28 }}>
                <Chip color={C.green} style={{ fontSize: 22 }}>Can support a low-cost approach</Chip>
              </Appear>
            </Card>
          </Appear>
          <Appear at={L(2) + 0.2} style={{ flex: 1 }}>
            <div style={{ color: C.rose, fontSize: 24, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>THE STRUCTURE DOES NOT PROVE</div>
            <Bullets
              at={L(2) + 0.4}
              step={0.9}
              icon="cross"
              size={30}
              gap={26}
              items={[
                "that every available Vanguard class has the lowest fee",
                "that competitors cannot offer a lower price",
                "that all possible service incentives are permanently resolved",
              ]}
            />
          </Appear>
        </Row>
      </Body>
    </>
  );
};

/* 09 — Share class */
export const ShareClass: React.FC = () => {
  const { L } = useScene();
  const classes = [
    { n: "Mutual-fund class", c: C.violet },
    { n: "ETF class", c: C.teal },
    { n: "Institutional class", c: C.amber },
  ];
  const attrs = ["Expenses", "Purchase requirements", "Trading mechanics"];
  return (
    <>
      <Title kicker="Vanguard">Compare the class the client can actually buy</Title>
      <Body>
        <Appear at={L(1) + 0.1} dir="pop" style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ background: `${C.blue}22`, border: `3px solid ${C.blue}`, borderRadius: 18, padding: "16px 40px", fontSize: 34, fontWeight: 800 }}>
            One underlying portfolio
          </div>
        </Appear>
        <Appear at={L(1) + 0.5} dir="none" style={{ display: "flex", justifyContent: "center", height: 60 }}>
          <svg width="900" height="60">
            {[150, 450, 750].map((x) => (
              <path key={x} d={`M 450 0 C 450 30, ${x} 30, ${x} 60`} stroke={C.line} strokeWidth="3" fill="none" />
            ))}
          </svg>
        </Appear>
        <Row gap={30} align="stretch">
          {classes.map((cl, i) => (
            <Appear key={cl.n} at={L(1) + 0.7 + i * 0.35} dir="up" style={{ flex: 1 }}>
              <Card accent={cl.c} style={{ height: 290 }}>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 18 }}>{cl.n}</div>
                {attrs.map((a, j) => (
                  <Appear key={a} at={L(1) + 2.6 + j * 0.45} dir="left" dist={14}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                      <span style={{ color: C.muted }}>{a}</span>
                      <span style={{ fontFamily: MONO, color: cl.c, fontWeight: 700 }}>{["differ", "differ", "differ"][j]}</span>
                    </div>
                  </Appear>
                ))}
              </Card>
            </Appear>
          ))}
        </Row>
        <Appear at={L(2) + 0.3} style={{ marginTop: 36 }}>
          <Row gap={16}>
            <Chip big color={C.blue}>Whole-portfolio asset total</Chip>
            <Neq size={54} />
            <Chip big color={C.teal}>Assets of one ticker</Chip>
          </Row>
        </Appear>
      </Body>
    </>
  );
};

/* 10 — Tax & patent */
export const TaxPatent: React.FC = () => {
  const { L } = useScene();
  return (
    <>
      <Title kicker="Vanguard">Tax mechanics and the patent — two separate questions</Title>
      <Body>
        <Row gap={50} align="flex-start">
          <Col gap={22} style={{ flex: 1 }}>
            <Appear at={L(0) + 0.2}>
              <Card accent={C.green} pad={24}>
                <Row gap={14} justify="flex-start">
                  <Chip color={C.green}>Qualifying in-kind redemptions</Chip>
                  <div style={{ fontSize: 30, color: C.muted }}>→</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>fewer fund-level realized gains</div>
                </Row>
              </Card>
            </Appear>
            <Appear at={L(0) + 2.4}>
              <Stamp at={L(0) + 2.6} rotate={-3} style={{ fontSize: 26 }}>not “tax-free”</Stamp>
            </Appear>
            <Appear at={L(1) + 0.2}>
              <div style={{ color: C.rose, fontSize: 22, fontWeight: 700, letterSpacing: 3, marginBottom: 10 }}>INVESTORS MAY STILL OWE TAX ON</div>
              <Bullets at={L(1) + 0.4} icon="dot" color={C.rose} size={26} items={["Distributions", "Selling appreciated shares", "…and taxable vs. tax-advantaged accounts differ"]} />
            </Appear>
          </Col>
          <Col gap={0} style={{ flex: 1 }}>
            <Appear at={L(2) + 0.1}>
              <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3, marginBottom: 16 }}>ETF-SHARE-CLASS TIMELINE</div>
            </Appear>
            {[
              { y: "2023", h: "Vanguard’s principal ETF-share-class patent expired", at: L(2) + 0.3, c: S.vanguard.color },
              { y: "Nov 2025", h: "SEC grants Dimensional conditional multi-class relief", at: L(3) + 0.3, c: C.blue },
              { y: "Others", h: "Must satisfy their own applicable legal requirements", at: L(3) + 1.6, c: C.dim },
            ].map((e, i) => (
              <Appear key={e.y} at={e.at} dir="left">
                <Row gap={20} justify="flex-start" align="stretch" style={{ marginBottom: 0 }}>
                  <div style={{ width: 150, fontFamily: MONO, fontSize: 30, fontWeight: 800, color: e.c, paddingTop: 14 }}>{e.y}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 9, background: e.c, marginTop: 20 }} />
                    {i < 2 && <div style={{ width: 3, flex: 1, background: C.line }} />}
                  </div>
                  <Card pad={18} style={{ flex: 1, marginBottom: 18, fontSize: 25, fontWeight: 600 }}>{e.h}</Card>
                </Row>
              </Appear>
            ))}
            <Appear at={L(2) + 2.4}>
              <Row gap={14} justify="flex-start">
                <Chip color={S.vanguard.color}>Patent expiration</Chip>
                <Neq size={44} />
                <Chip color={C.blue}>Regulatory permission</Chip>
              </Row>
            </Appear>
            <Appear at={L(3) + 3.2} style={{ marginTop: 18 }}>
              <Note>A shared-portfolio structure does not guarantee a particular after-tax result.</Note>
            </Appear>
          </Col>
        </Row>
      </Body>
    </>
  );
};

/* 11 — State Street */
export const StateStreet: React.FC = () => {
  const { L } = useScene();
  return (
    <>
      <Title kicker="State Street">More than one S&amp;P 500 product</Title>
      <Body>
        <Appear at={L(0) + 0.1}>
          <Note style={{ marginBottom: 18 }}>State Street Investment Management (formerly State Street Global Advisors)</Note>
        </Appear>
        <Row gap={34} align="stretch">
          {[
            { tk: "SPY", sub: "Unit investment trust", pts: ["Dividend handling differs", "Less portfolio-management flexibility"], at: L(0) + 0.6 },
            { tk: "SPYM", sub: "Lower-cost S&P 500 exposure", pts: ["Open-end ETF structure", "Distinct product, same sponsor"], at: L(0) + 1.2 },
          ].map((f) => (
            <Appear key={f.tk} at={f.at} dir="up" style={{ flex: 1 }}>
              <Card accent={S.statestreet.color} style={{ height: 250 }}>
                <Row gap={18} justify="flex-start">
                  <div style={{ fontFamily: MONO, fontSize: 52, fontWeight: 900, color: S.statestreet.color }}>{f.tk}</div>
                  <Chip color={C.dim} style={{ fontSize: 21 }}>{f.sub}</Chip>
                </Row>
                <div style={{ marginTop: 18 }}>
                  <Bullets at={L(2) + 0.2} step={0.5} icon="dot" size={25} gap={10} items={f.pts} />
                </div>
              </Card>
            </Appear>
          ))}
        </Row>
        <Appear at={L(1) + 0.3} style={{ marginTop: 26 }}>
          <Card pad={18} accent={C.rose} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 27, fontWeight: 700 }}>
            <Chip color={C.rose}>SPY-only comparison</Chip> → can miss the within-sponsor alternative
          </Card>
        </Appear>
        <Appear at={L(3) + 0.2} style={{ marginTop: 30 }}>
          <Row gap={12} style={{ flexWrap: "wrap" }}>
            {["Tracking", "Expenses", "Distributions", "Taxes", "Execution costs"].map((x, i) => (
              <Appear key={x} at={L(3) + 0.3 + i * 0.3} dir="up" dist={12}>
                <Chip color={C.teal}>{x}</Chip>
              </Appear>
            ))}
            <div style={{ fontSize: 34, color: C.muted, margin: "0 8px" }}>→</div>
            <Appear at={L(3) + 2.0} dir="pop">
              <Chip big color={C.green}>Realized result</Chip>
            </Appear>
          </Row>
          <Note style={{ textAlign: "center", marginTop: 12 }}>Structure alone does not establish a guaranteed return ranking.</Note>
        </Appear>
      </Body>
    </>
  );
};

/* 12 — Disclosed expenses */
export const Disclosed: React.FC = () => {
  const { L } = useScene();
  return (
    <>
      <Title kicker="State Street">A dated disclosure — not a quote</Title>
      <Body>
        <Appear at={L(0) + 0.1}>
          <Card style={{ padding: 0, overflow: "hidden", position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "22px 40px", color: C.muted, fontSize: 24, letterSpacing: 2, borderBottom: `1px solid ${C.line}` }}>
              <div>PRODUCT</div>
              <div>STRUCTURE</div>
              <div style={{ textAlign: "right" }}>GROSS EXPENSE RATIO</div>
            </div>
            {[
              { tk: "SPY", st: "Unit investment trust", er: 0.0945, at: L(0) + 0.4 },
              { tk: "SPYM", st: "Open-end ETF", er: 0.02, at: L(0) + 1.6 },
            ].map((r) => (
              <Appear key={r.tk} at={r.at} dir="left">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "26px 40px", alignItems: "center", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 46, fontWeight: 900, color: S.statestreet.color }}>{r.tk}</div>
                  <div style={{ fontSize: 26, color: C.text }}>{r.st}</div>
                  <div style={{ textAlign: "right", fontSize: 54, fontWeight: 900 }}>
                    <Counter at={r.at + 0.2} to={r.er} decimals={r.tk === "SPY" ? 4 : 2} suffix="%" dur={1.2} />
                  </div>
                </div>
              </Appear>
            ))}
            <div style={{ padding: "18px 40px", color: C.dim, fontSize: 22 }}>
              Source: State Street comparison dated July 2026 · displayed market data as of March 31, 2026
            </div>
            <div style={{ position: "absolute", right: 50, bottom: 6 }}>
              <Stamp at={L(1) + 0.3} rotate={-3} style={{ fontSize: 26 }}>Dated example</Stamp>
            </div>
          </Card>
        </Appear>
        <Appear at={L(1) + 1.2} style={{ marginTop: 34 }}>
          <Row gap={40}>
            <Bullets at={L(1) + 1.3} step={0.5} icon="cross" items={["Not a current quotation", "Not an instruction to switch"]} />
            <Bullets at={L(1) + 2.4} step={0.5} icon="check" items={["Check the prospectus", "Check live trading conditions before an order"]} />
          </Row>
        </Appear>
      </Body>
    </>
  );
};

/* 13 — Expense arithmetic */
export const ExpenseMath: React.FC = () => {
  const { L, t } = useScene();
  const base = 500000;
  const a = 0.000945 * base; // 472.5
  const b = 0.0002 * base; // 100
  const wA = interpolate(t, [L(1) + 0.5, L(1) + 2.0], [0, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const wB = interpolate(t, [L(1) + 3.6, L(1) + 5.0], [0, (900 * b) / a], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <>
      <Title kicker="The cost question">Show the cost question you are answering</Title>
      <Body>
        <Appear at={L(0) + 0.2}>
          <Row gap={16} justify="flex-start">
            <Chip big color={C.blue}>Unchanged average balance: $500,000</Chip>
            <Chip big color={C.dim}>1 year</Chip>
            <Chip big color={C.dim}>expense ratio only</Chip>
          </Row>
        </Appear>
        <Col gap={30} style={{ marginTop: 40 }}>
          {[
            { er: "0.0945%", w: wA, v: a, c: C.rose, at: L(1) + 0.5 },
            { er: "0.02%", w: wB, v: b, c: C.green, at: L(1) + 3.6 },
          ].map((r) => (
            <Appear key={r.er} at={r.at - 0.2} dir="left">
              <Row gap={22} justify="flex-start">
                <div style={{ width: 170, fontFamily: MONO, fontSize: 36, fontWeight: 800, color: r.c }}>{r.er}</div>
                <div style={{ width: 900, height: 64, background: "rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ width: r.w, height: "100%", background: `linear-gradient(90deg, ${r.c}88, ${r.c})` }} />
                </div>
                <div style={{ fontSize: 46, fontWeight: 900, minWidth: 260 }}>
                  <Counter at={r.at} to={r.v} decimals={2} prefix="$" dur={1.5} />
                </div>
              </Row>
            </Appear>
          ))}
        </Col>
        <Appear at={L(2) + 0.2} style={{ marginTop: 36 }}>
          <Row gap={22} justify="flex-start">
            <div style={{ width: 170, color: C.muted, fontSize: 26, fontWeight: 700 }}>Difference</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: C.amber }}>
              <Counter at={L(2) + 0.3} to={a - b} decimals={2} prefix="$" dur={1.2} />
            </div>
            <div style={{ color: C.muted, fontSize: 26 }}>per year, under these assumptions</div>
          </Row>
        </Appear>
        <Appear at={L(3) + 0.3} style={{ marginTop: 34 }}>
          <Card pad={20} accent={C.dim}>
            <Row gap={14} justify="flex-start" style={{ flexWrap: "wrap" }}>
              <Chip color={C.dim} style={{ fontSize: 22 }}>Constant balance</Chip>
              <Chip color={C.dim} style={{ fontSize: 22 }}>No other costs</Chip>
              <Chip color={C.dim} style={{ fontSize: 22 }}>No taxes</Chip>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.rose, marginLeft: 10 }}>Not a forecast of ending values.</div>
            </Row>
          </Card>
        </Appear>
      </Body>
    </>
  );
};

const Segment: React.FC<{ h: number; full: number; show: boolean; label: string; style: React.CSSProperties }> = ({ h, full, show, label, style }) => {
  const inside = full >= 44;
  return (
    <div style={{ height: h, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, ...style }}>
      {show && inside && <div style={{ overflow: "hidden", maxHeight: "100%" }}>{label}</div>}
      {show && !inside && (
        <div style={{ position: "absolute", left: "100%", marginLeft: 14, top: "50%", transform: "translateY(-50%)", whiteSpace: "nowrap", color: C.text, fontSize: 22 }}>← {label}</div>
      )}
    </div>
  );
};

/* 14 — Cost budget */
export const CostBudget: React.FC = () => {
  const { L, t } = useScene();
  const scale = 2.4; // px per dollar
  const grow = (at: number, v: number) =>
    interpolate(t, [at, at + 1.1], [0, v * scale], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const funds = [
    { n: "Fund A", er: "0.02%", tr: "0.10% round-trip", e: 20, tc: 100, atE: L(1) + 0.4, atT: L(1) + 2.4, c: C.teal, atTotal: L(4) + 0.5 },
    { n: "Fund B", er: "0.0945%", tr: "0.01% round-trip", e: 94.5, tc: 10, atE: L(2) + 0.4, atT: L(2) + 2.4, c: C.violet, atTotal: L(4) + 1.6 },
  ];
  return (
    <>
      <Title kicker="The cost question">A deliberately simple one-year cost budget</Title>
      <Body>
        <Appear at={L(0) + 0.2}>
          <Row gap={14} justify="flex-start" style={{ flexWrap: "wrap" }}>
            <Chip big color={C.blue}>New $100,000 purchase</Chip>
            <Chip color={C.dim}>1-year hold</Chip>
            <Chip color={C.dim}>identical gross exposure</Chip>
            <Chip color={C.dim}>zero gross return</Chip>
            <Chip color={C.dim}>no other costs or taxes</Chip>
          </Row>
        </Appear>
        <Row gap={80} align="flex-end" style={{ marginTop: 30, height: 470 }}>
          {funds.map((f) => (
            <Appear key={f.n} at={f.atE - 0.3} dir="up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ height: 70, display: "flex", alignItems: "flex-end" }}>
                <Appear at={f.atTotal} dir="pop">
                  <div style={{ fontSize: 50, fontWeight: 900, color: f.c, fontFamily: MONO }}>
                    <Counter at={f.atTotal} to={f.e + f.tc} decimals={2} prefix="$" dur={1.0} />
                  </div>
                </Appear>
              </div>
              <div style={{ width: 300, display: "flex", flexDirection: "column-reverse", borderBottom: `3px solid ${C.line}` }}>
                <Segment h={grow(f.atE, f.e)} full={f.e * scale} show={t > f.atE + 0.6} label={`expense $${f.e.toFixed(2).replace(/\.00$/, "")}`} style={{ background: f.c, borderRadius: "0 0 8px 8px", color: C.bg }} />
                <Segment h={grow(f.atT, f.tc)} full={f.tc * scale} show={t > f.atT + 0.6} label={`trading $${f.tc.toFixed(2).replace(/\.00$/, "")}`} style={{ background: `${f.c}66`, border: `2px dashed ${f.c}`, borderRadius: "8px 8px 0 0" }} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{f.n}</div>
              <div style={{ color: C.muted, fontSize: 22, textAlign: "center" }}>
                expense {f.er} · trading {f.tr}
              </div>
            </Appear>
          ))}
          <Col gap={24} style={{ flex: 1, alignSelf: "center", paddingBottom: 40 }}>
            <Appear at={L(5) + 0.2}>
              <Card accent={C.amber} pad={22}>
                <Row gap={14} justify="flex-start">
                  <Chip color={C.teal}>Lower expense ratio</Chip>
                  <Neq size={46} />
                  <Chip color={C.amber}>Lower total cost</Chip>
                </Row>
                <div style={{ color: C.muted, fontSize: 24, marginTop: 12 }}>Here, Fund B’s higher expense ratio still gives the lower modeled one-year cost.</div>
              </Card>
            </Appear>
            <Appear at={L(6) + 0.2}>
              <Card pad={20} accent={C.dim}>
                <div style={{ color: C.rose, fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>NOT A MODEL OF ACTUAL SPY / SPYM</div>
                <div style={{ color: C.muted, fontSize: 23, marginTop: 8 }}>
                  Trade size, holding period, prices and taxes can change it. An existing taxable position must also include the sale-tax cost and the no-change alternative.
                </div>
              </Card>
            </Appear>
          </Col>
        </Row>
      </Body>
    </>
  );
};
