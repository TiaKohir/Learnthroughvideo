import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { plan } from "./timeline";
import { FPS, LEAD } from "./theme";
import { Background, ProgressBar, SceneFrame } from "./components/Frame";
import * as P1 from "./scenes/part1";
import * as P2 from "./scenes/part2";
import * as P3 from "./scenes/part3";

const SCENES: Record<string, React.FC> = {
  "01-intro": P1.Intro,
  "02-bottom-line": P1.BottomLine,
  "03-what-it-means": P1.WhatItMeans,
  "04-dated-numbers": P1.DatedNumbers,
  "05-definitions": P1.Definitions,
  "06-blackrock": P1.BlackRock,
  "07-overlap": P1.Overlap,
  "08-vanguard": P2.Vanguard,
  "09-share-class": P2.ShareClass,
  "10-tax-patent": P2.TaxPatent,
  "11-state-street": P2.StateStreet,
  "12-disclosed-expenses": P2.Disclosed,
  "13-expense-math": P2.ExpenseMath,
  "14-cost-budget": P2.CostBudget,
  "15-governance": P3.Governance,
  "16-voting-policy": P3.VotingPolicy,
  "17-liquidity": P3.Liquidity,
  "18-sharpe": P3.Sharpe,
  "19-client": P3.Client,
  "20-takeaways": P3.Takeaways,
  "21-closing": P3.Closing,
};

export const Video: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {plan.map((s) => {
      const Scene = SCENES[s.id];
      if (!Scene) throw new Error(`No scene component for ${s.id}`);
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={s.id}>
          <SceneFrame scene={s}>
            <Scene />
          </SceneFrame>
          <Sequence from={Math.round(LEAD * FPS)} name={`${s.id}-audio`}>
            <Audio src={staticFile(s.audio)} />
          </Sequence>
        </Sequence>
      );
    })}
    <ProgressBar />
  </AbsoluteFill>
);
