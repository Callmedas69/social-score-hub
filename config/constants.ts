import { base } from "wagmi/chains";
import { HELLOONCHAIN_ADDRESS, HELLOONCHAIN_ABI } from "@/abi/HelloOnchain";

// Supported chains
export const SUPPORTED_CHAINS = [base] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

// Contract addresses per chain
export const CHECKIN_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  [base.id]: HELLOONCHAIN_ADDRESS,
};

// Chain display configuration (brand colors from .docs/brand_color.md)
export const CHAIN_CONFIG: Record<SupportedChainId, {
  name: string;
  color: string;
  logo: string;
  wordmark?: string;
}> = {
  [base.id]: {
    name: "Base",
    color: "#0000FF",
    logo: "/chains/Base_lockup_2color.svg"
  },
};

// Legacy exports for backward compatibility
export const SUPPORTED_CHAIN = base;
export const CONTRACT_ADDRESS = HELLOONCHAIN_ADDRESS;
export const CONTRACT_ABI = HELLOONCHAIN_ABI;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "HELLO ONCHAIN";
export const APP_DESCRIPTION = "Daily check-in for rewards";
export const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || "http://localhost:3000";

// SSA ProfileSBT contract address
export const SSA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SSA_INDEX as `0x${string}`;

// RPC Configuration (server-side only)
export const ALCHEMY_RPC_URLS: Record<SupportedChainId, string> = {
  [base.id]: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};

// Minimal ERC20 ABI for token metadata
export const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;
