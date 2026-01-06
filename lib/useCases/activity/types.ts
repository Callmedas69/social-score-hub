/**
 * Activity Use Case Types
 */

import { AlchemyTransfer } from "@/lib/repositories/types";

export interface NormalizedTransaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string | null;
  value: string;
  isError: boolean;
  isContractInteraction: boolean;
  gasUsed: string | null;
  effectiveGasPrice: string | null;
}

export interface ActivitySummaryResult {
  transactions: NormalizedTransaction[];
}

// Re-export for convenience
export type { AlchemyTransfer };
