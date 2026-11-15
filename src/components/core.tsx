import React, { createContext, useContext } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, MONO } from "../theme";
import type { ScenePlan } from "../timeline";

export type SceneCtx = {
  plan: ScenePlan;
  t: number; // seconds since narration start (negative during lead-in)
  L: (i: number) => number; // start time (s) of narration line i
  E: (i: number) => number; // end time (s) of narration line i
};
export const SceneContext = createContext<SceneCtx | null>(null);
export const useScene = () => {
  const c = useContext(SceneContext);
  if (!c) throw new Error("useScene outside SceneContext");
  return c;
};

/** Progress 0..1 of a spring starting at time `at` (seconds). */
export const useSpringAt = (at: number, opts?: { damping?: number; stiffness?: number; mass?: number }) => {
  const { t } = useScene();
  const { fps } = useVideoConfig();
  const f = Math.max(0, Math.round((t - at) * fps));
  if (t < at) return 0;
  return spring({ frame: f, fps, config: { damping: opts?.damping ?? 18, stiffness: opts?.stiffness ?? 120, mass: opts?.mass ?? 1 } });
};

export const Appear: React.FC<{
  at: number;
  dir?: "up" | "down" | "left" | "right" | "none" | "pop";
  dist?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, dir = "up", dist = 28, style, children }) => {
  const p = useSpringAt(at);
  const op = interpolate(p, [0, 0.6], [0, 1], { extrapolateRight: "clamp" });
  let transform = "";
  const d = (1 - p) * dist;
  if (dir === "up") transform = `translateY(${d}px)`;
  if (dir === "down") transform = `translateY(${-d}px)`;
  if (dir === "left") transform = `translateX(${d}px)`;
  if (dir === "right") transform = `translateX(${-d}px)`;
  if (dir === "pop") transform = `scale(${0.85 + 0.15 * p})`;
  return (
    <div style={{ opacity: op, transform, willChange: "transform, opacity", ...style }}>
      {children}
    </div>
  );
};

/** Animated number. */
export const Counter: React.FC<{
  at: number;
  to: number;
  from?: number;
  dur?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ at, to, from = 0, dur = 1.2, decimals = 0, prefix = "", suffix = "", style }) => {
  const { t } = useScene();
  const v = interpolate(t, [at, at + dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const s = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span style={{ fontFamily: MONO, fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {s}
      {suffix}
    </span>
  );
};

export const Title: React.FC<{ at?: number; children: React.ReactNode; kicker?: string }> = ({ at = -0.4, children, kicker }) => (
  <Appear at={at} dir="down" style={{ position: "absolute", top: 72, left: 120, right: 120 }}>
    {kicker && (
      <div style={{ color: C.teal, fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>
        {kicker}
      </div>
    )}
    <div style={{ fontSize: 58, fontWeight: 800, color: C.text, letterSpacing: -1, lineHeight: 1.1 }}>{children}</div>
  </Appear>
);

export const Card: React.FC<{
  style?: React.CSSProperties;
  accent?: string;
  children: React.ReactNode;
  pad?: number;
}> = ({ style, accent, children, pad = 28 }) => (
  <div
    style={{
      background: C.surface,
      border: `1px solid ${C.line}`,
      borderTop: accent ? `5px solid ${accent}` : `1px solid ${C.line}`,
      borderRadius: 20,
      padding: pad,
      boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ color?: string; children: React.ReactNode; style?: React.CSSProperties; big?: boolean }> = ({
  color = C.teal,
  children,
  style,
  big,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: big ? "14px 24px" : "10px 18px",
      borderRadius: 999,
      background: `${color}22`,
      border: `1.5px solid ${color}88`,
      color: C.text,
      fontSize: big ? 30 : 24,
      fontWeight: 600,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Neq: React.FC<{ size?: number; color?: string }> = ({ size = 64, color = C.rose }) => (
  <div style={{ fontSize: size, fontWeight: 800, color, lineHeight: 1, fontFamily: MONO, padding: "0 10px" }}>≠</div>
);

export const Check: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={`${color}22`} stroke={color} strokeWidth="1.6" />
    <path d="M7 12.5l3.2 3.2L17 9" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Cross: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = C.rose }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={`${color}22`} stroke={color} strokeWidth="1.6" />
    <path d="M8 8l8 8M16 8l-8 8" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/** Red "stamp" label that pops in. */
export const Stamp: React.FC<{ at: number; children: React.ReactNode; color?: string; style?: React.CSSProperties; rotate?: number }> = ({
  at,
  children,
  color = C.rose,
  style,
  rotate = -6,
}) => {
  const p = useSpringAt(at, { damping: 12, stiffness: 180 });
  return (
    <div
      style={{
        opacity: p,
        transform: `rotate(${rotate}deg) scale(${1.6 - 0.6 * p})`,
        border: `5px solid ${color}`,
        color,
        borderRadius: 14,
        padding: "10px 22px",
        fontSize: 34,
        fontWeight: 900,
        letterSpacing: 3,
        textTransform: "uppercase",
        fontFamily: FONT,
        background: "rgba(11,18,32,0.75)",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Row of items with a label list, each item fades in at `at + i*step`. */
export const Bullets: React.FC<{
  items: React.ReactNode[];
  at: number;
  step?: number;
  icon?: "check" | "cross" | "dot";
  size?: number;
  gap?: number;
  color?: string;
}> = ({ items, at, step = 0.35, icon = "check", size = 28, gap = 18, color }) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>
    {items.map((it, i) => (
      <Appear key={i} at={at + i * step} dir="left" dist={20}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, fontSize: size, color: C.text, lineHeight: 1.3 }}>
          <div style={{ flex: "none", marginTop: 2 }}>
            {icon === "check" ? <Check size={size + 6} color={color} /> : icon === "cross" ? <Cross size={size + 6} color={color} /> : (
              <div style={{ width: 12, height: 12, borderRadius: 6, background: color ?? C.teal, marginTop: size / 2 - 4 }} />
            )}
          </div>
          <div>{it}</div>
        </div>
      </Appear>
    ))}
  </div>
);

/** Horizontal animated bar. */
export const Bar: React.FC<{ at: number; width: number; height?: number; color: string; dur?: number; label?: React.ReactNode }> = ({
  at,
  width,
  height = 44,
  color,
  dur = 1.1,
  label,
}) => {
  const { t } = useScene();
  const w = interpolate(t, [at, at + dur], [0, width], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: w, height, borderRadius: 10, background: `linear-gradient(90deg, ${color}99, ${color})`, boxShadow: `0 0 24px ${color}55` }} />
      {label !== undefined && <div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>{label}</div>}
    </div>
  );
};

export const Wordmark: React.FC<{ name: string; color: string; size?: number; style?: React.CSSProperties }> = ({ name, color, size = 44, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 26px",
      borderRadius: 16,
      background: `${color}1a`,
      border: `2px solid ${color}`,
      color: C.text,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: -0.5,
      ...style,
    }}
  >
    <div style={{ width: size * 0.5, height: size * 0.5, borderRadius: 6, background: color }} />
    {name}
  </div>
);

export const Note: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; color?: string }> = ({ children, style, color = C.muted }) => (
  <div style={{ color, fontSize: 24, lineHeight: 1.35, fontStyle: "italic", ...style }}>{children}</div>
);

export const Row: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties; align?: string; justify?: string }> = ({
  children,
  gap = 24,
  style,
  align = "center",
  justify = "center",
}) => <div style={{ display: "flex", alignItems: align as any, justifyContent: justify as any, gap, ...style }}>{children}</div>;

export const Col: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({ children, gap = 16, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>
);

/** Content area below the title. */
export const Body: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: 230, bottom: 230, ...style }}>{children}</div>
);

export const useT = () => useScene().t;
export const useFrameLocal = () => useCurrentFrame();
