// Neumorphic light theme: one near-white surface colour everywhere, depth comes from soft paired shadows.
export const C = {
  bg: "#EEF1F6", // page + card colour (neumorphism needs a slightly tinted white so the light shadow reads)
  bg2: "#E6EAF2",
  surface: "#EEF1F6",
  surface2: "#F6F8FB",
  track: "#E1E6EF", // inset tracks (bars, progress)
  line: "rgba(31,42,68,0.08)",
  text: "#1F2A44",
  muted: "#5B6B85",
  dim: "#8B98B0",
  onAccent: "#FFFFFF",
  teal: "#0FA896",
  amber: "#E0962E",
  rose: "#E05552",
  blue: "#2F7BEF",
  violet: "#7560F0",
  green: "#1F9D63",
};
export const SPONSOR = {
  blackrock: { name: "BlackRock", color: C.amber },
  vanguard: { name: "Vanguard", color: C.rose },
  statestreet: { name: "State Street", color: C.blue },
};
// Soft extruded shadow (raised), small variant, and pressed (inset) variant.
export const SHADOW = "12px 12px 28px rgba(163,177,198,0.55), -12px -12px 28px rgba(255,255,255,0.95)";
export const SHADOW_SM = "6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.95)";
export const INSET = "inset 5px 5px 10px rgba(163,177,198,0.55), inset -5px -5px 10px rgba(255,255,255,0.95)";
export const FONT = "'Inter', 'DejaVu Sans', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
export const FPS = 30;
export const LEAD = 0.6; // seconds of visual lead-in before narration starts
export const TAIL = 0.9; // seconds held after narration ends
