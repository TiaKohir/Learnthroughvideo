import React from "react";
import { interpolate, Easing } from "remotion";
import { C, MONO, SPONSOR } from "../theme";
import { Appear, Body, Bullets, Card, Chip, Col, Neq, Note, Row, Stamp, Title, Wordmark, useScene, useSpringAt } from "../components/core";

const S = SPONSOR;

/* 15 — Governance population */
export const Governance: React.FC = () => {
  const { L, t } = useScene();
  const w = (at: number, v: number) => interpolate(t, [at, at + 1.0], [0, v], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <>
      <Title kicker="Governance">Governance statistics need a defined population</Title>
      <Body>
        <Row gap={50} align="flex-start">
          <Col gap={22} style={{ flex: 1 }}>
            <Appear at={L(1) + 0.3}>
              <Card accent={C.violet}>
                <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3 }}>ONE INFLUENTIAL PAPER</div>
                <Row gap={14} justify="flex-start" style={{ marginTop: 12, flexWrap: "wrap" }}>
                  <Chip color={C.violet}>Published 2017</Chip>
                  <Chip color={C.violet}>Uses 2015 data</Chip>
                  <Chip color={C.violet}>Three firms as one block</Chip>
                </Row>
                <Row gap={10} justify="flex-start" style={{ marginTop: 18 }}>
                  {[S.blackrock, S.vanguard, S.statestreet].map((s) => (
                    <div key={s.name} style={{ width: 70, height: 70, borderRadius: 12, background: s.color, opacity: 0.9 }} />
                  ))}
                  <div style={{ fontSize: 28, color: C.muted, margin: "0 10px" }}>=</div>
                  <div style={{ width: 280, height: 70, borderRadius: 12, border: `3px dashed ${C.violet}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, fontWeight: 700, whiteSpace: "nowrap" }}>
                    hypothetical block
                  </div>
                </Row>
              </Card>
            </Appear>
            <Appear at={L(2) + 0.3}>
              <Card accent={C.rose} pad={22}>
                <Row gap={16} justify="flex-start">
                  <Chip color={C.violet}>Historical combined-block result</Chip>
                  <Neq size={44} />
                  <div style={{ fontSize: 26, fontWeight: 700 }}>one firm, individually, today</div>
                </Row>
                <div style={{ color: C.muted, fontSize: 23, marginTop: 10 }}>…being the largest shareholder in the same proportion of companies.</div>
              </Card>
            </Appear>
          </Col>
          <Col gap={22} style={{ flex: 1 }}>
            <Appear at={L(3) + 0.2}>
              <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3, marginBottom: 10 }}>VOTING STATISTICS DEPEND ON</div>
              <Row gap={12} justify="flex-start">
                {["Sample", "Proposal type", "Weighting"].map((x, i) => (
                  <Appear key={x} at={L(3) + 0.3 + i * 0.3} dir="up" dist={12}>
                    <Chip color={C.teal}>{x}</Chip>
                  </Appear>
                ))}
              </Row>
              <Appear at={L(3) + 1.8} style={{ marginTop: 16 }}>
                <Row gap={14} justify="flex-start">
                  <Chip color={C.dim}>Manager-average support rate</Chip>
                  <Neq size={40} />
                  <Chip color={C.dim}>Share of all votes cast</Chip>
                </Row>
              </Appear>
            </Appear>
            <Appear at={L(4) + 0.2}>
              <Card pad={22}>
                {[
                  { n: "Support for management resolutions", v: 0.78, c: C.blue, at: L(4) + 0.4 },
                  { n: "Support for shareholder resolutions", v: 0.33, c: C.amber, at: L(4) + 1.2 },
                ].map((b) => (
                  <div key={b.n} style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{b.n}</div>
                    <div style={{ height: 30, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden", width: 640 }}>
                      <div style={{ width: `${w(b.at, b.v) * 100}%`, height: "100%", background: b.c }} />
                    </div>
                  </div>
                ))}
                <Row gap={14} justify="flex-start">
                  <div style={{ color: C.dim, fontSize: 21 }}>Illustrative bars — different proposal sets.</div>
                  <Appear at={L(4) + 2.6} dir="pop">
                    <Chip color={C.rose} style={{ fontSize: 22 }}>Do not sum to 100%</Chip>
                  </Appear>
                </Row>
              </Card>
            </Appear>
          </Col>
        </Row>
      </Body>
    </>
  );
};

/* 16 — Voting policy */
export const VotingPolicy: React.FC = () => {
  const { L } = useScene();
  const docs = [
    { n: "Current voting policy", c: C.blue },
    { n: "Disclosures", c: C.teal },
    { n: "Investor-choice (pass-through) arrangements", c: C.violet },
  ];
  return (
    <>
      <Title kicker="Governance">Read the current policy for each fund</Title>
      <Body>
        <Row gap={36} align="stretch">
          {docs.map((d, i) => (
            <Appear key={d.n} at={L(0) + 0.3 + i * 0.5} dir="up" style={{ flex: 1 }}>
              <Card accent={d.c} style={{ height: 260, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <svg width="60" height="72" viewBox="0 0 60 72" style={{ marginBottom: "auto" }}>
                  <path d="M6 2h34l14 14v54H6z" fill={`${d.c}22`} stroke={d.c} strokeWidth="2.5" />
                  <path d="M40 2v14h14" fill="none" stroke={d.c} strokeWidth="2.5" />
                  {[30, 40, 50].map((y) => (
                    <line key={y} x1="14" y1={y} x2="46" y2={y} stroke={d.c} strokeWidth="2.5" opacity="0.7" />
                  ))}
                </svg>
                <div style={{ fontSize: 30, fontWeight: 800 }}>{d.n}</div>
              </Card>
            </Appear>
          ))}
        </Row>
        <Appear at={L(1) + 0.2} style={{ marginTop: 40 }}>
          <div style={{ color: C.rose, fontSize: 22, fontWeight: 700, letterSpacing: 3, marginBottom: 14 }}>A PASS-THROUGH CHOICE</div>
          <Bullets
            at={L(1) + 0.4}
            step={1.3}
            icon="cross"
            size={30}
            gap={22}
            items={[
              "may apply only to particular funds or accounts",
              "is not every investor personally voting every underlying share",
              "does not mean all three firms organize their voting teams the same way",
            ]}
          />
        </Appear>
      </Body>
    </>
  );
};

/* 17 — Liquidity */
export const Liquidity: React.FC = () => {
  const { L, t } = useScene();
  const reveal = interpolate(t, [L(2) + 0.2, L(2) + 3.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // illustrative price path and NAV path
  const N = 60;
  const pts = Array.from({ length: N }, (_, i) => {
    const x = (i / (N - 1)) * 760;
    const stress = i > 32 && i < 48 ? Math.sin(((i - 32) / 16) * Math.PI) : 0;
    const base = 160 - Math.sin(i / 7) * 14;
    return { x, price: base + stress * 85, nav: base + stress * 40 };
  });
  const shown = Math.max(2, Math.floor(reveal * N));
  const path = (k: "price" | "nav") => pts.slice(0, shown).map((p, i) => `${i ? "L" : "M"} ${p.x} ${p[k]}`).join(" ");
  return (
    <>
      <Title kicker="Liquidity & competition">Liquidity is a product question</Title>
      <Body>
        <Row gap={50} align="flex-start">
          <Col gap={22} style={{ flex: 1 }}>
            <Appear at={L(1) + 0.2}>
              <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3, marginBottom: 10 }}>ETF LIQUIDITY DEPENDS ON</div>
              <Row gap={12} justify="flex-start" style={{ flexWrap: "wrap" }}>
                {["Underlying markets", "Creation / redemption activity", "Secondary-market volume"].map((x, i) => (
                  <Appear key={x} at={L(1) + 0.3 + i * 0.45} dir="up" dist={12}>
                    <Chip color={C.teal}>{x}</Chip>
                  </Appear>
                ))}
              </Row>
            </Appear>
            <Appear at={L(2) + 0.1}>
              <Card style={{ position: "relative" }}>
                <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3 }}>IN STRESS (ILLUSTRATIVE)</div>
                <svg width="760" height="260" style={{ marginTop: 10 }}>
                  <rect x={pts[32].x} y="0" width={pts[48].x - pts[32].x} height="260" fill={`${C.rose}14`} opacity={reveal > 0.55 ? 1 : 0} />
                  <path d={path("nav")} stroke={C.muted} strokeWidth="4" fill="none" strokeDasharray="10 8" />
                  <path d={path("price")} stroke={C.blue} strokeWidth="4" fill="none" />
                </svg>
                <Row gap={24} justify="flex-start">
                  <Row gap={8}><div style={{ width: 28, height: 4, background: C.blue }} /><span style={{ fontSize: 22 }}>Exchange price</span></Row>
                  <Row gap={8}><div style={{ width: 28, height: 4, background: C.muted, borderTop: `4px dashed ${C.muted}` }} /><span style={{ fontSize: 22 }}>Reported NAV (may use less current prices)</span></Row>
                </Row>
                <div style={{ position: "absolute", right: 30, top: 14 }}>
                  <Stamp at={L(2) + 3.2} rotate={-3} style={{ fontSize: 22 }}>Interpret the discount</Stamp>
                </div>
              </Card>
            </Appear>
          </Col>
          <Col gap={22} style={{ flex: 0.9 }}>
            <Appear at={L(3) + 0.2}>
              <Card accent={C.amber}>
                <div style={{ fontSize: 28, fontWeight: 800 }}>Sponsor dependence: a fair due-diligence question</div>
                <div style={{ marginTop: 16 }}>
                  <Bullets at={L(3) + 1.0} step={1.2} icon="cross" size={25} gap={12} items={["does not justify assuming an unmodeled systemic collapse", "three sponsor names ≠ three independent custodial & trading infrastructures"]} />
                </div>
              </Card>
            </Appear>
            <Appear at={L(3) + 4.6}>
              <Row gap={12} justify="flex-start">
                <Chip color={C.green}>Check actual service providers</Chip>
                <Chip color={C.green}>Check contingency arrangements</Chip>
              </Row>
            </Appear>
          </Col>
        </Row>
      </Body>
    </>
  );
};

/* 18 — Sharpe arithmetic */
export const Sharpe: React.FC = () => {
  const { L } = useScene();
  const eq = (s: string, c = C.text) => <span style={{ color: c }}>{s}</span>;
  return (
    <>
      <Title kicker="Liquidity & competition">The active–passive arithmetic, with its assumptions</Title>
      <Body>
        <Col gap={22}>
          <Appear at={L(1) + 0.2}>
            <Row gap={14} justify="flex-start" style={{ flexWrap: "wrap" }}>
              <div style={{ color: C.muted, fontSize: 24, letterSpacing: 2 }}>SHARPE’S SIMPLIFIED FRAMEWORK ASSUMES</div>
              {["Same market for both groups", "Passive holds market-cap weights", "Dollar-weighted returns", "Fixed market"].map((x, i) => (
                <Appear key={x} at={L(1) + 0.4 + i * 0.45} dir="up" dist={12}>
                  <Chip color={C.dim}>{x}</Chip>
                </Appear>
              ))}
            </Row>
          </Appear>
          <Appear at={L(2) + 0.2}>
            <Card style={{ fontFamily: MONO, fontSize: 42, fontWeight: 700, textAlign: "center", padding: "30px 40px" }}>
              {eq("Gross return", C.teal)} {eq("(active)", C.muted)} {eq(" = ")} {eq("Gross return", C.blue)} {eq("(passive)", C.muted)}
            </Card>
          </Appear>
          <Appear at={L(2) + 1.6}>
            <Card style={{ fontFamily: MONO, fontSize: 42, fontWeight: 700, textAlign: "center", padding: "30px 40px" }}>
              {eq("Net difference", C.amber)} {eq(" = ")} {eq("active costs", C.rose)} {eq(" − ")} {eq("passive costs", C.green)}
              <div style={{ fontFamily: "inherit", fontSize: 26, color: C.muted, marginTop: 14, fontWeight: 500 }}>its sign depends on which costs are higher</div>
            </Card>
          </Appear>
          <Appear at={L(3) + 0.2}>
            <Row gap={40} align="flex-start">
              <div style={{ flex: 1 }}>
                <div style={{ color: C.muted, fontSize: 22, letterSpacing: 3, marginBottom: 10 }}>COMPLICATIONS IN REAL FUNDS</div>
                <Bullets at={L(3) + 0.4} step={0.4} icon="dot" color={C.amber} size={26} gap={10} items={["Changing index constituents", "Changing shares outstanding", "Actual implementation trades"]} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.rose, fontSize: 22, letterSpacing: 3, marginBottom: 10 }}>IT IS NOT A PREDICTION THAT</div>
                <Bullets at={L(3) + 2.4} step={0.6} icon="cross" size={26} gap={10} items={["every active fund loses", "a category label identifies a future winner"]} />
              </div>
            </Row>
          </Appear>
        </Col>
      </Body>
    </>
  );
};

/* 19 — Client conversation */
export const Client: React.FC = () => {
  const { L } = useScene();
  const Bubble: React.FC<{ side: "left" | "right"; who: string; color: string; children: React.ReactNode }> = ({ side, who, color, children }) => (
    <div style={{ display: "flex", justifyContent: side === "left" ? "flex-start" : "flex-end" }}>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ color, fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textAlign: side }}>{who}</div>
        <div
          style={{
            background: side === "left" ? C.surface2 : `${color}26`,
            border: `1.5px solid ${side === "left" ? C.line : color}`,
            borderRadius: side === "left" ? "6px 24px 24px 24px" : "24px 6px 24px 24px",
            padding: "24px 32px",
            fontSize: 32,
            lineHeight: 1.35,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
  return (
    <>
      <Title kicker="The client conversation">“Are these index funds interchangeable?”</Title>
      <Body>
        <Col gap={40} style={{ marginTop: 30 }}>
          <Appear at={L(1) - 0.1} dir="left">
            <Bubble side="left" who="CLIENT" color={C.muted}>Are these index funds interchangeable?</Bubble>
          </Appear>
          <Appear at={L(2) - 0.1} dir="right">
            <Bubble side="right" who="ADVISOR" color={C.teal}>
              They may target similar exposure, but we should compare the actual class, trading costs, taxes, account access and voting policy. Let’s include keeping what you own before deciding whether a different fund would improve the result.
            </Bubble>
          </Appear>
          <Appear at={L(2) + 5.0}>
            <Row gap={12} style={{ flexWrap: "wrap" }}>
              {["Actual class", "Trading costs", "Taxes", "Account access", "Voting policy", "No-change alternative"].map((x, i) => (
                <Appear key={x} at={L(2) + 5.2 + i * 0.25} dir="up" dist={10}>
                  <Chip color={i === 5 ? C.green : C.teal}>{x}</Chip>
                </Appear>
              ))}
            </Row>
          </Appear>
        </Col>
      </Body>
    </>
  );
};

/* 20 — Key takeaways */
export const Takeaways: React.FC = () => {
  const { L } = useScene();
  const items = [
    "Keep company AUM, client holdings, voting authority and control separate.",
    "Compare actual available products rather than selecting from corporate scale alone.",
    "Ownership and tax structures can matter without guaranteeing the lowest client cost.",
    "Include State Street’s different S&P 500 products in a relevant comparison.",
    "Match governance statistics to their dates, samples and weighting methods.",
    "Evaluate total cost and feasible implementation before recommending a change.",
  ];
  return (
    <>
      <Title kicker="Key takeaways">Six things to carry into the next client file</Title>
      <Body>
        <Col gap={16}>
          {items.map((it, i) => (
            <Appear key={i} at={L(i + 1) - 0.1} dir="left">
              <Row gap={22} justify="flex-start">
                <div style={{ width: 64, height: 64, borderRadius: 32, background: `${C.teal}22`, border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 30, fontWeight: 800, color: C.teal, flex: "none" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 31, fontWeight: 600, lineHeight: 1.25 }}>{it}</div>
              </Row>
            </Appear>
          ))}
        </Col>
      </Body>
    </>
  );
};

/* 21 — Closing */
export const Closing: React.FC = () => {
  const { L } = useScene();
  return (
    <>
      <Title kicker="The advisor’s edge">Reputation is context, not a substitute for due diligence</Title>
      <Body>
        <Row gap={50} align="flex-start">
          <Appear at={L(0) + 0.2} style={{ flex: 1 }}>
            <Card accent={C.teal} style={{ height: 330 }}>
              <div style={{ color: C.teal, fontSize: 22, letterSpacing: 3, fontWeight: 700 }}>CERTIFIED FUND SPECIALIST® (CFS®)</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12 }}>Develops fund-structure and portfolio-analysis skills</div>
              <div style={{ marginTop: 22 }}>
                <Bullets at={L(1) + 0.3} step={0.9} size={27} items={["Explain which differences matter for an actual account", "Calculate their consequences", "Preserve a no-change alternative"]} />
              </div>
            </Card>
          </Appear>
          <Col gap={24} style={{ flex: 1 }}>
            <Appear at={L(2) + 0.2}>
              <Row gap={20} justify="center" style={{ flexWrap: "wrap" }}>
                {[S.blackrock, S.vanguard, S.statestreet].map((s) => (
                  <Wordmark key={s.name} name={s.name} color={s.color} size={34} />
                ))}
              </Row>
              <Note style={{ textAlign: "center", marginTop: 16, fontSize: 28, color: C.text, fontStyle: "normal", fontWeight: 600 }}>
                Context for due diligence — never a substitute for it.
              </Note>
            </Appear>
            <Appear at={L(3) + 0.2}>
              <Card pad={22} accent={C.dim}>
                <div style={{ color: C.muted, fontSize: 22, lineHeight: 1.45 }}>
                  Based on the IBF article “The Big Three: BlackRock, Vanguard, State Street” (published Feb 27, 2026; updated Nov 14, 2026).
                  Company figures are dated 2025 examples; product and expense figures are dated 2026 disclosure examples; the cost budget is hypothetical.
                  Verify against primary sources before acting. Not investment advice.
                </div>
              </Card>
            </Appear>
          </Col>
        </Row>
      </Body>
    </>
  );
};
