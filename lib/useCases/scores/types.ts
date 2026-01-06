/**
 * Score Use Case Types
 */

// Talent Protocol
export interface TalentScoreResult {
  builder_score: number | null;
  builder_rank: number | null;
  creator_score: number | null;
  creator_rank: number | null;
}

// Gitcoin Passport
export interface GitcoinScoreResult {
  score: number | null;
  passing_score: boolean;
  threshold: number;
}

// Neynar Farcaster
export interface NeynarUserResult {
  fid: number | null;
  username: string | null;
  display_name: string | null;
  pfp_url: string | null;
  neynar_score: number | null;
}

// Quotient
export interface QuotientScoreResult {
  data: Array<{
    fid: number;
    reputation_score: number;
    [key: string]: unknown;
  }>;
  count: number;
}

// Ethos
export interface EthosScoreResult {
  score: number | null;
  level: string | null;
}
