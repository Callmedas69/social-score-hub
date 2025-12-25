"use client";

import { useSocialScores } from "@/hooks/useSocialScores";
import { ScoreCard } from "./ScoreCard";
import {
  getTierLabel,
  TALENT_BUILDER_TIERS,
  TALENT_CREATOR_TIERS,
  QUOTIENT_TIERS,
  ETHOS_TIERS,
  SSA_TIERS,
} from "@/config/tiers";

// Helper to format Quotient tier with optional rank
function formatQuotientTier(
  score: number | null | undefined,
  rank: number | null | undefined
): string | null {
  if (score === null || score === undefined) return null;
  const tier = getTierLabel(score, QUOTIENT_TIERS);
  if (!tier) return null;
  return rank ? `${tier} • Rank #${rank}` : tier;
}

export function SocialScores() {
  const { talent, neynar, gitcoin, quotient, ethos, ssa } = useSocialScores();

  return (
    <div className="">
      <div className="score-description pb-4 opacity-0">
        <p className="text-[10px] text-gray-400 italic">
          All scores shown are sourced directly from third party providers. This page does not compute, weight, or rank users, it exists solely as a reference view for reputation signals used across Web3.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Talent Builder Score */}
        <div className="score-card opacity-0">
          <ScoreCard
            provider="Builder"
            providerId="talent"
            providerLogo="/score_provider/Talent_Protocol.jpg"
            score={talent.data?.builder_score ?? null}
            tierLabel={getTierLabel(talent.data?.builder_score ?? null, TALENT_BUILDER_TIERS)}
            description="Builder Reputation"
            isLoading={talent.isLoading}
            error={talent.error as Error | null}
            notFound={!talent.isLoading && !talent.data}
          />
        </div>

        {/* Talent Creator Score */}
        <div className="score-card opacity-0">
          <ScoreCard
            provider="Creator"
            providerId="talent"
            providerLogo="/score_provider/Talent_Protocol.jpg"
            score={talent.data?.creator_score ?? null}
            tierLabel={getTierLabel(talent.data?.creator_score ?? null, TALENT_CREATOR_TIERS)}
            description="Creator Reputation"
            isLoading={talent.isLoading}
            error={null}
            notFound={!talent.isLoading && talent.data?.creator_score === null}
          />
        </div>

        {/* Neynar */}
        <div className="score-card opacity-0">
          <ScoreCard
            provider="Neynar"
            providerId="neynar"
            providerLogo="/score_provider/Neynar_400x400.jpg"
            score={neynar.data?.neynar_score ?? null}
            tierLabel="-"
            description="Account Quality"
            isLoading={neynar.isLoading}
            error={neynar.error as Error | null}
            notFound={!neynar.isLoading && !neynar.data}
          />
        </div>

        {/* Gitcoin Passport */}
        <div className="score-card opacity-0">
          <ScoreCard
            provider="Passport"
            providerId="gitcoin"
            providerLogo="/score_provider/human_paspport.jpg"
            score={gitcoin.data?.score ?? null}
            tierLabel={gitcoin.data?.passing_score ? "Verified Human" : null}
            description="Sybil Resistance"
            isLoading={gitcoin.isLoading}
            error={gitcoin.error as Error | null}
            notFound={!gitcoin.isLoading && !gitcoin.data}
          />
        </div>

        {/* Quotient */}
        <div className="score-card opacity-0">
          <ScoreCard
            provider="Quotient"
            providerId="quotient"
            providerLogo="/score_provider/Quotient.png"
            score={quotient.data?.quotientScore ?? null}
            tierLabel={formatQuotientTier(quotient.data?.quotientScore, quotient.data?.quotientRank)}
            description="Social Momentum"
            isLoading={quotient.isLoading}
            error={quotient.error as Error | null}
            notFound={!quotient.isLoading && !neynar.data && !quotient.data}
          />
        </div>

        {/* ETHOS Network */}
        <div className="score-card opacity-0">
          <ScoreCard
            provider="ETHOS"
            providerId="ethos"
            providerLogo="/score_provider/ethos_logo.png"
            score={ethos.data?.score ?? null}
            tierLabel={getTierLabel(ethos.data?.score ?? null, ETHOS_TIERS)}
            description="Onchain Credibility"
            isLoading={ethos.isLoading}
            error={ethos.error as Error | null}
            notFound={!ethos.isLoading && !ethos.data}
          />
        </div>

        {/* TrustCheck - SSA Index */}
        <div className="score-card opacity-0">
          <ScoreCard
            provider="TrustCheck"
            providerId="ssa"
            providerLogo="/score_provider/ssa_logo_v2.svg"
            score={ssa.data ?? null}
            tierLabel={ssa.hasMinted ? getTierLabel(ssa.data ?? null, SSA_TIERS) : null}
            description="SSA Index"
            isLoading={ssa.isLoading}
            error={ssa.error as Error | null}
            notFound={!ssa.isLoading && !ssa.hasMinted && ssa.data === 0}
          />
        </div>
      </div>

      <div className="score-note opacity-0 mt-4">
        <p className="text-[8px] text-gray-400 italic">
          Note: Each score follows its own methodology and update cycle. Interpretation and usage are determined by the originating protocol.
        </p>
      </div>
    </div>
  );
}
