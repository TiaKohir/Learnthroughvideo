import React, { useEffect, useState } from "react";
import { Composition, continueRender, delayRender } from "remotion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/jetbrains-mono/800.css";
import { Video } from "./Video";
import { totalFrames } from "./timeline";
import { FPS } from "./theme";

const WithFonts: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  return <Video />;
};

export const Root: React.FC = () => (
  <Composition id="BigThree" component={WithFonts} durationInFrames={totalFrames} fps={FPS} width={1920} height={1080} />
);
