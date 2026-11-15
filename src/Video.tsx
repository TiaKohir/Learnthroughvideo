import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { plan } from "./timeline";
import { FPS, LEAD } from "./theme";
import { Background, ProgressBar, SceneFrame } from "./components/Frame";
import { LAYOUT_COMPONENTS } from "./layouts";
import { customScenes } from "./generated/custom";

export const Video: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {plan.map((s) => {
      const Custom = customScenes[s.id];
      const Layout = LAYOUT_COMPONENTS[s.scene.layout];
      if (s.scene.layout === "custom" && !Custom) throw new Error(`Scene ${s.id} is layout "custom" but lessons/<slug>/scenes.tsx exports no component for it`);
      if (!Custom && !Layout) throw new Error(`Unknown layout "${s.scene.layout}" in scene ${s.id}`);
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
          <SceneFrame scene={s}>{Custom ? <Custom /> : <Layout s={s.scene} />}</SceneFrame>
          <Sequence from={Math.round(LEAD * FPS)} name={`${s.id}-audio`}>
            <Audio src={staticFile(s.audio)} />
          </Sequence>
        </Sequence>
      );
    })}
    <ProgressBar />
  </AbsoluteFill>
);
