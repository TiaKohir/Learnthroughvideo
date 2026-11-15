import React from "react";
import { interpolate, Easing } from "remotion";
import { C, MONO, SPONSOR } from "../../../src/theme";
import { Appear, Body, Bullets, Card, Chip, Col, Counter, Neq, Note, Row, Stamp, Title, Wordmark, useScene, useSpringAt } from "../../../src/components/core";

const S = SPONSOR;

/* 01 — Intro */
export const Intro: React.FC = () => {
  const { L } = useScene();
  return (
    <>
      <Body style={{ top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 48 }}>
        <Appear at={L(1) + 0.2} dir="down">
          <div style={{ textAlign: "center" }}>
            <div style={{ color: C.teal, fontSize: 26, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", marginBottom: 14 }}>
              Mutual Funds &amp; ETFs
            </div>
            <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>The Big Three</div>
          </div>
        </Appear>
        <Row gap={34}>
          {[S.blackrock, S.vanguard, S.statestreet].map((s, i) => (
            <Appear key={s.name} at={L(0) + i * 0.75} dir="pop">
              <Wordmark name={s.name} color={s.color} size={50} />
            </Appear>
          ))}
        </Row>
        <Appear at={L(2) + 0.3} dir="up">
          <Row gap={16}>
            {["Businesses", "Ownership", "Products", "Total cost", "Taxes", "Voting"].map((x, i) => (
              <Appear key={x} at={L(2) + 0.4 + i * 0.25} dir="up" dist={14}>
                <Chip>{x}</Chip>
              </Appear>
            ))}
          </Row>
        </Appear>
        <Appear at={L(2) + 2.2} dir="none">
          <Note>A 10-minute animated lesson · based on an IBF article</Note>
        </Appear>
      </Body>
    </>
  );
};

/* 02 — Bottom line */
export const BottomLine: React.FC = () => {
  const { L } = useScene();
  const rows = [
    ["Different businesses", "What the firm does"],
    ["Different ownership", "Who owns the manager"],
    ["Different products", "What a client can buy"],
  ];
  return (
    <>
      <Title kicker="The bottom line">Three sponsors. Three different stories.</Title>
      <Body>
        <Row gap={28} style={{ marginTop: 10 }}>
          {rows.map(([h, sub], i) => (
            <Appear key={h} at={L(1) + 0.3 + i * 0.5} dir="up" style={{ flex: 1 }}>
              <Card accent={[S.blackrock.color, S.vanguard.color, S.statestreet.color][i]} style={{ height: 150 }}>
                <div style={{ fontSize: 34, fontWeight: 800 }}>{h}</div>
                <div style={{ color: C.muted, fontSize: 24, marginTop: 8 }}>{sub}</div>
              </Card>
            </Appear>
          ))}
        </Row>
        <Appear at={L(2) + 0.3} dir="up" style={{ marginTop: 44 }}>
          <Row gap={14}>
            <Chip big color={C.amber}>Corporate asset totals</Chip>
            <Neq size={54} />
            <Chip big color={C.violet}>Fund holdings</Chip>
            <Neq size={54} />
            <Chip big color={C.blue}>Voting authority</Chip>
          </Row>
          <Note style={{ textAlign: "center", marginTop: 14 }}>Different measures — never add or swap them.</Note>
        </Appear>
        <Row gap={60} style={{ marginTop: 44, alignItems: "flex-start" }}>
          <Appear at={L(3) + 0.2} dir="left" style={{ flex: 1 }}>
            <div style={{ color: C.green, fontSize: 24, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>COMPARE</div>
            <Bullets at={L(3) + 0.4} step={0.45} items={["Actual funds", "Total costs", "Tax consequences", "Voting policies"]} />
          </Appear>
          <Appear at={L(3) + 2.2} dir="right" style={{ flex: 1 }}>
            <div style={{ color: C.rose, fontSize: 24, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>DO NOT ASSUME</div>
            <Bullets at={L(3) + 2.4} icon="cross" items={["Sponsor scale ⇒ best client outcome"]} />
          </Appear>
        </Row>
      </Body>
    </>
  );
};

/* 03 — What the label means */
export const WhatItMeans: React.FC = () => {
  const { L, t } = useScene();
  const measures = ["Mutual funds", "ETFs", "Separate accounts", "Assets under administration"];
  // illustrative heights per measure for four anonymous firms
  const H = [
    [0.9, 0.7, 0.55, 0.4],
    [0.95, 0.5, 0.75, 0.3],
    [0.6, 0.85, 0.5, 0.7],
    [0.5, 0.45, 0.65, 1.0],
  ];
  const cycle = Math.max(0, t - L(2) - 0.6);
  const idx = Math.min(3, Math.floor(cycle / 2.0));
  const next = Math.min(3, idx + 1);
  const frac = Math.min(1, (cycle % 2.0) / 0.6);
  const ease = Easing.inOut(Easing.cubic)(frac);
  const heights = H[idx].map((h, i) => (t > L(2) + 0.6 ? h + (H[next][i] - h) * ease : 0.0));
  return (
    <>
      <Title kicker="What “Big Three” means here">A label from governance debates — not a universal ranking</Title>
      <Body>
        <Row gap={60} align="flex-start">
          <Col gap={26} style={{ flex: 1, paddingTop: 10 }}>
            <Appear at={L(0) + 0.2}>
              <Card accent={C.teal}>
                <div style={{ fontSize: 30, fontWeight: 700 }}>Identifies BlackRock, Vanguard and State Street</div>
                <div style={{ color: C.muted, fontSize: 24, marginTop: 8 }}>in discussions of index investing and corporate governance</div>
              </Card>
            </Appear>
            <Appear at={L(1) + 0.2}>
              <Card accent={C.rose}>
                <div style={{ fontSize: 30, fontWeight: 700 }}>Not a claim about “the three largest”</div>
                <div style={{ color: C.muted, fontSize: 24, marginTop: 8 }}>under every definition of global asset management</div>
              </Card>
            </Appear>
            <Appear at={L(2) + 0.2}>
              <Note>Rankings change with what is counted →</Note>
            </Appear>
          </Col>
          <Appear at={L(2) + 0.1} style={{ flex: 1.1 }}>
            <Card style={{ height: 520 }}>
              <Row gap={10} justify="flex-start" style={{ flexWrap: "wrap" }}>
                {measures.map((m, i) => (
                  <Chip key={m} color={i === idx && t > L(2) + 0.6 ? C.teal : C.dim} style={{ fontSize: 21 }}>
                    {m}
                  </Chip>
                ))}
              </Row>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 40, height: 300, marginTop: 34, padding: "0 20px", borderBottom: `2px solid ${C.line}` }}>
                {heights.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: "100%", height: 280 * h, borderRadius: 10, background: [C.amber, C.rose, C.blue, C.violet][i], transition: "none" }} />
                  </div>
                ))}
              </div>
              <Row gap={40} style={{ padding: "10px 20px 0" }}>
                {["Firm A", "Firm B", "Firm C", "Firm D"].map((f) => (
                  <div key={f} style={{ flex: 1, textAlign: "center", color: C.muted, fontSize: 22 }}>{f}</div>
                ))}
              </Row>
              <Note style={{ fontSize: 20, marginTop: 14, color: C.dim }}>Illustrative heights only — the ordering shifts with the measure.</Note>
            </Card>
          </Appear>
        </Row>
      </Body>
    </>
  );
};

/* 04 — Dated numbers */
export const DatedNumbers: React.FC = () => {
  const { L } = useScene();
  return (
    <>
      <Title kicker="Dated example">Company totals are not fund totals</Title>
      <Body>
        <Row gap={40} align="stretch">
          <Appear at={L(0) + 0.2} style={{ flex: 1 }}>
            <Card accent={S.blackrock.color} style={{ height: 300 }}>
              <Wordmark name="BlackRock" color={S.blackrock.color} size={30} />
              <div style={{ fontSize: 96, fontWeight: 900, marginTop: 18, letterSpacing: -2 }}>
                <span style={{ color: C.muted, fontSize: 48, verticalAlign: "top", marginRight: 10 }}>≈</span>
                <Counter at={L(0) + 0.4} to={14.0} decimals={1} prefix="$" suffix="T" dur={1.6} />
              </div>
              <div style={{ color: C.muted, fontSize: 24 }}>reported AUM, year-end 2025</div>
            </Card>
          </Appear>
          <Appear at={L(1) + 0.2} style={{ flex: 1 }}>
            <Card accent={S.statestreet.color} style={{ height: 300 }}>
              <Wordmark name="State Street" color={S.statestreet.color} size={30} />
              <div style={{ fontSize: 96, fontWeight: 900, marginTop: 18, letterSpacing: -2 }}>
                <span style={{ color: C.muted, fontSize: 48, verticalAlign: "top", marginRight: 10 }}>≈</span>
                <Counter at={L(1) + 0.4} to={5.7} decimals={1} prefix="$" suffix="T" dur={1.6} />
              </div>
              <div style={{ color: C.muted, fontSize: 24 }}>reported AUM, incl. assets where it is solely marketing agent</div>
            </Card>
          </Appear>
        </Row>
        <Appear at={L(2) + 0.3} style={{ marginTop: 34 }}>
          <Row gap={14} justify="flex-start" style={{ flexWrap: "wrap" }}>
            <div style={{ color: C.muted, fontSize: 24, marginRight: 10 }}>Totals include far more than U.S. equity index funds:</div>
            {["Active & index", "Private markets", "Cash management", "Technology", "Non-U.S. assets"].map((x, i) => (
              <Appear key={x} at={L(2) + 0.5 + i * 0.2} dir="up" dist={10}>
                <Chip color={C.dim} style={{ fontSize: 21 }}>{x}</Chip>
              </Appear>
            ))}
          </Row>
        </Appear>
        <Appear at={L(3) + 0.2} style={{ marginTop: 40, position: "relative" }}>
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 20, fontFamily: MONO, fontSize: 40, fontWeight: 700, paddingLeft: 48 }}>
            <span style={{ color: C.amber }}>$14.0T</span> + <span style={{ color: C.blue }}>$5.7T</span>
            <span style={{ color: C.muted }}>÷</span> U.S. ETF assets
            <span style={{ color: C.muted }}>=</span> <span style={{ color: C.rose }}>?</span>
          </Card>
          <div style={{ position: "absolute", right: 48, top: 14 }}>
            <Stamp at={L(3) + 1.4} rotate={-3} style={{ fontSize: 28 }}>Not a meaningful share</Stamp>
          </div>
        </Appear>
      </Body>
    </>
  );
};

/* 05 — Four different things */
export const Definitions: React.FC = () => {
  const { L } = useScene();
  const items = [
    { k: "Economic interest", v: "Fund shareholders", c: C.green },
    { k: "Voting authority", v: "Who casts the proxy", c: C.blue },
    { k: "Beneficial ownership", v: "A legal definition", c: C.violet },
    { k: "Corporate control", v: "A separate test", c: C.amber },
  ];
  return (
    <>
      <Title kicker="Four different things">Keep the definitions separate</Title>
      <Body>
        <Appear at={L(0) + 0.2}>
          <Card accent={C.green} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>Shareholders hold the economic interest in a fund’s assets.</div>
            <div style={{ color: C.muted, fontSize: 25, marginTop: 8 }}>The adviser does not simply own those client investments for its own corporate benefit.</div>
          </Card>
        </Appear>
        <Row gap={0}>
          {items.map((it, i) => (
            <React.Fragment key={it.k}>
              {i > 0 && (
                <Appear at={L(1) + 0.3 + i * 0.4} dir="pop">
                  <Neq size={58} />
                </Appear>
              )}
              <Appear at={L(1) + i * 0.4} dir="up">
                <div
                  style={{
                    width: 300,
                    height: 300,
                    borderRadius: 150,
                    border: `3px solid ${it.c}`,
                    background: `radial-gradient(circle at 50% 40%, ${it.c}33, ${it.c}08)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>{it.k}</div>
                  <div style={{ color: C.muted, fontSize: 22, marginTop: 10 }}>{it.v}</div>
                </div>
              </Appear>
            </React.Fragment>
          ))}
        </Row>
        <Appear at={L(2) + 0.3} style={{ marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          <div style={{ fontSize: 34, color: C.muted, textDecoration: "line-through", textDecorationColor: C.rose, textDecorationThickness: 4 }}>
            “synonyms”
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>→ overstates what a reported position means</div>
        </Appear>
      </Body>
    </>
  );
};

/* 06 — BlackRock */
export const BlackRock: React.FC = () => {
  const { L } = useScene();
  const segs = ["Index investing", "Active investing", "Public markets", "Private markets", "Cash management", "Technology services"];
  return (
    <>
      <Title kicker="BlackRock">A broad investment and technology business</Title>
      <Body>
        <Appear at={L(1) + 0.1}>
          <Row gap={0} justify="flex-start">
            <div style={{ fontFamily: MONO, fontSize: 48, fontWeight: 800, color: S.blackrock.color, width: 160 }}>2009</div>
            <div style={{ width: 70, height: 3, background: C.line }} />
            <Card pad={18} style={{ marginLeft: 14 }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>Acquires Barclays Global Investors</div>
              <div style={{ color: C.muted, fontSize: 23 }}>iShares joins the organization</div>
            </Card>
            <Appear at={L(1) + 1.2} dir="left" style={{ marginLeft: 24 }}>
              <Chip color={S.blackrock.color} big>iShares</Chip>
            </Appear>
          </Row>
        </Appear>
        <div style={{ marginTop: 44, position: "relative" }}>
          <Appear at={L(2)} dir="none">
            <div style={{ color: C.muted, fontSize: 24, letterSpacing: 3, marginBottom: 16 }}>THE COMPANY AUM FIGURE COVERS</div>
          </Appear>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {segs.map((s, i) => (
              <Appear key={s} at={L(2) + 0.3 + i * 0.35} dir="up">
                <Card pad={22} accent={i === 0 ? S.blackrock.color : undefined} style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>
                  {s}
                  {i === 0 && <div style={{ color: S.blackrock.color, fontSize: 22, fontWeight: 600, marginTop: 6 }}>includes iShares</div>}
                </Card>
              </Appear>
            ))}
          </div>
        </div>
        <Appear at={L(3) + 0.3} style={{ marginTop: 36 }}>
          <Row gap={16}>
            <Chip big color={C.amber}>Company AUM</Chip>
            <Neq size={54} />
            <Chip big color={S.blackrock.color}>iShares assets alone</Chip>
          </Row>
        </Appear>
      </Body>
    </>
  );
};

/* 07 — Overlap */
export const Overlap: React.FC = () => {
  const { L, t } = useScene();
  const p = useSpringAt(L(1) + 0.2, { damping: 20 });
  const shift = interpolate(p, [0, 1], [240, 95]);
  return (
    <>
      <Title kicker="BlackRock">Breadth is not the same as distinct risk</Title>
      <Body>
        <Row gap={60} align="flex-start">
          <Appear at={L(0) + 0.2} style={{ flex: 1 }}>
            <Card style={{ height: 470, position: "relative", overflow: "hidden" }}>
              <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3 }}>TWO FUNDS, ONE SPONSOR</div>
              <div style={{ position: "absolute", left: "50%", top: 250, transform: "translate(-50%,-50%)", width: 700, height: 340 }}>
                {[
                  { n: "Sector ETF", c: C.violet, x: -shift },
                  { n: "Broad-market ETF", c: C.teal, x: shift },
                ].map((o) => (
                  <div
                    key={o.n}
                    style={{
                      position: "absolute",
                      left: 350 + o.x - 160,
                      top: 10,
                      width: 320,
                      height: 320,
                      borderRadius: 160,
                      background: `${o.c}33`,
                      border: `3px solid ${o.c}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: o.x < 0 ? "flex-start" : "flex-end",
                      padding: 30,
                      fontSize: 28,
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ width: 150 }}>{o.n}</div>
                  </div>
                ))}
                {t > L(1) + 1.2 && (
                  <Appear at={L(1) + 1.2} dir="pop" style={{ position: "absolute", left: 350, top: 300 }}>
                    <div style={{ background: C.bg, border: `2px solid ${C.rose}`, color: C.rose, borderRadius: 12, padding: "8px 14px", fontSize: 24, fontWeight: 800, whiteSpace: "nowrap", transform: "translate(-50%,-50%)" }}>
                      substantial overlap
                    </div>
                  </Appear>
                )}
              </div>
              <div style={{ position: "absolute", bottom: 20, left: 28, right: 28, color: C.muted, fontSize: 22, textAlign: "center" }}>
                Different names and mandates can still mean overlapping holdings.
              </div>
            </Card>
          </Appear>
          <Col gap={28} style={{ flex: 1 }}>
            <Appear at={L(1) + 1.8}>
              <div style={{ color: C.green, fontSize: 24, fontWeight: 700, letterSpacing: 3, marginBottom: 12 }}>INSPECT</div>
              <Bullets at={L(1) + 2.0} step={0.4} items={["Holdings", "Benchmarks", "Legal structures", "Service arrangements"]} />
            </Appear>
            <Appear at={L(2) + 0.3}>
              <Card accent={C.rose} pad={22}>
                <Row gap={12} justify="flex-start" style={{ flexWrap: "wrap" }}>
                  <Chip color={C.amber}>Corporate scale</Chip>
                  <Neq size={44} />
                  <Chip color={C.dim}>Spread</Chip>
                  <Chip color={C.dim}>Depth</Chip>
                  <Chip color={C.dim}>Tracking</Chip>
                </Row>
                <div style={{ color: C.muted, fontSize: 24, marginTop: 14 }}>Examine the actual ETF and the proposed order — not the flagship’s reputation.</div>
              </Card>
            </Appear>
          </Col>
        </Row>
      </Body>
    </>
  );
};
