"use client";

import { base } from "wagmi/chains";
import { ChainCheckInCardBase } from "./ChainCheckInCardBase";

export function BaseCheckInCard() {
  return (
    <ChainCheckInCardBase
      chainId={base.id}
      className="bg-white border-blue-200"
      showRewardsPreview
    />
  );
}
