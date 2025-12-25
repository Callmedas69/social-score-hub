"use client";

import { createConfig, http } from "wagmi";
import { base, celo, optimism } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

export const wagmiConfig = createConfig({
  chains: [base, celo, optimism],
  transports: {
    [base.id]: http("/api/rpc/base"),
    [celo.id]: http("/api/rpc/celo"),
    [optimism.id]: http("/api/rpc/optimism"),
  },
  connectors: [farcasterMiniApp()],
});
