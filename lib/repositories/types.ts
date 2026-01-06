/**
 * Repository Layer Types
 *
 * These types represent raw data from external APIs.
 * No business logic transformations - just data access.
 */

// GoPlus Security API
export interface GoPlusRawResponse {
  code: number;
  message: string;
  result: Record<string, string>;
}

// Alchemy Asset Transfers API
export interface AlchemyTransfer {
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  category: string;
  blockNum: string;
  metadata: {
    blockTimestamp: string;
  };
}

export interface AlchemyTransfersResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: AlchemyTransfer[];
    pageKey?: string;
  };
}

export interface TransactionReceipt {
  gasUsed: string;
  effectiveGasPrice: string;
}

// Talent Protocol API
export interface TalentScoreRaw {
  slug: string;
  points: number;
  rank_position: number | null;
  last_calculated_at: string | null;
}

export interface TalentApiResponse {
  scores: TalentScoreRaw[];
}

// Gitcoin Passport API
export interface GitcoinRawResponse {
  score: string | null;
  passing_score: boolean;
}

// Neynar Farcaster API
export interface NeynarUserRaw {
  fid?: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  experimental?: {
    neynar_user_score?: number;
  };
}

// Quotient API
export interface QuotientUserData {
  fid: number;
  reputation_score: number;
  [key: string]: unknown;
}

export interface QuotientRawResponse {
  data: QuotientUserData[];
  count: number;
}

// Ethos Network API
export interface EthosRawResponse {
  score: number | null;
  level: string | null;
}

// Generic repository error
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly source?: string
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
