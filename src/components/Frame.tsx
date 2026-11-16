import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, LEAD, SHADOW, INSET } from "../theme";
import type { ScenePlan } from "../timeline";
import { SceneContext, Appear } from "./core";
import { plan, totalFrames, chapters, headerTitle } from "../timeline";

export const Background: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {/* very soft light pools so the flat surface has some life */}
    <div style={{ position: "absolute", left: -200, top: -250, width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)" }} />
    <div style={{ position: "absolute", right: -250, bottom: -300, width: 1000, height: 1000, borderRadius: 500, background: "radial-gradient(circle, rgba(163,177,198,0.22) 0%, rgba(163,177,198,0) 70%)" }} />
  </AbsoluteFill>
);

/** Wraps a scene: context, fade in/out, chapter chip, subtitles. */
export const SceneFrame: React.FC<{ scene: ScenePlan; children: React.ReactNode }> = ({ scene, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - LEAD;
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [scene.frames - 14, scene.frames - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctx = {
    plan: scene,
    t,
    L: (i: number) => scene.lines[Math.min(i, scene.lines.length - 1)].start,
    E: (i: number) => scene.lines[Math.min(i, scene.lines.length - 1)].end,
  };
  const active = scene.lines.find((l) => t >= l.start - 0.15 && t < l.end + 0.35) ?? null;
  return (
    <SceneContext.Provider value={ctx}>
      <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut), fontFamily: FONT, color: C.text }}>
        {/* chapter chip */}
        <div style={{ position: "absolute", top: 28, right: 120, color: C.dim, fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>
          {headerTitle} · {String(scene.index + 1).padStart(2, "0")}/{String(plan.length).padStart(2, "0")}
        </div>
        {children}
        {/* subtitle */}
        <div style={{ position: "absolute", left: 160, right: 160, bottom: 56, display: "flex", justifyContent: "center" }}>
          {active && (
            <div
              key={active.start}
              style={{
                background: C.surface,
                boxShadow: SHADOW,
                borderRadius: 20,
                padding: "16px 30px",
                fontSize: 30,
                lineHeight: 1.35,
                color: C.text,
                textAlign: "center",
                maxWidth: 1500,
              }}
            >
              {active.text}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </SceneContext.Provider>
  );
};

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = frame / totalFrames;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: C.track, boxShadow: INSET }}>
      <div style={{ width: `${pct * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.teal}, ${C.blue})` }} />
      {chapters.map((ch) => {
        const first = plan.find((p) => p.chapter === ch)!;
        return (
          <div
            key={ch}
            style={{ position: "absolute", left: `${(first.from / totalFrames) * 100}%`, top: 0, width: 2, height: 10, background: "rgba(31,42,68,0.18)" }}
          />
        );
      })}
    </div>
  );
};

export { Appear };
