// Custom (hand-built) scene components for this lesson, keyed by scene id.
// Scenes with layout "custom" in script.json are rendered with these.
import type React from "react";
import * as P1 from "./scenes/part1";
import * as P2 from "./scenes/part2";
import * as P3 from "./scenes/part3";

const scenes: Record<string, React.FC> = {
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
export default scenes;
