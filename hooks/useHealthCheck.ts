"use client";

import { useMemo } from "react";
import { useWalletSecurity, SecurityFlag } from "./useWalletSecurity";
import { useSocialScores } from "./useSocialScores";
import { useOnchainActivity } from "./useOnchainActivity";

export type HealthGrade = "A" | "B" | "C" | "D" | "F";

export interface HealthTip {
  type: "warning" | "improvement" | "info";
  message: string;
  priority: number; // 1 = highest
}

export interface HealthCheckResult {
  overallScore: number;
  grade: HealthGrade;
  securityScore: number;
  reputationScore: number;
  engagementScore: number;
  flags: SecurityFlag[];
  tips: HealthTip[];
  isLoading: boolean;
  error: Error | null;
}

function getGrade(score: number): HealthGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getGradeColor(grade: HealthGrade): string {
  switch (grade) {
    case "A":
      return "text-green-500";
    case "B":
      return "text-blue-500";
    case "C":
      return "text-yellow-500";
    case "D":
      return "text-orange-500";
    case "F":
      return "text-red-500";
  }
}

function getGradeBgColor(grade: HealthGrade): string {
  switch (grade) {
    case "A":
      return "bg-green-500/10 border-green-500/30";
    case "B":
      return "bg-blue-500/10 border-blue-500/30";
    case "C":
      return "bg-yellow-500/10 border-yellow-500/30";
    case "D":
      return "bg-orange-500/10 border-orange-500/30";
    case "F":
      return "bg-red-500/10 border-red-500/30";
  }
}

export function useHealthCheck(): HealthCheckResult {
  const {
    score: securityScore,
    flags,
    isLoading: securityLoading,
    error: securityError,
  } = useWalletSecurity();

  const {
    talent,
    neynar,
    gitcoin,
    quotient,
    ethos,
    ssa,
    isLoading: scoresLoading,
  } = useSocialScores();

  const {
    summary,
    isLoading: activityLoading,
    error: activityError,
  } = useOnchainActivity();

  // Calculate reputation score (average of available social scores, normalized to 0-100)
  const reputationScore = useMemo(() => {
    const scores: number[] = [];

    // Talent builder score (0-100)
    if (talent.data?.builder_score != null) {
      scores.push(Math.min(100, talent.data.builder_score));
    }

    // Neynar score (0-1, multiply by 100)
    if (neynar.data?.neynar_score != null) {
      scores.push(neynar.data.neynar_score * 100);
    }

    // Gitcoin score (0-100+, cap at 100)
    if (gitcoin.data?.score != null) {
      scores.push(Math.min(100, gitcoin.data.score * 2)); // Score threshold is ~50, so multiply by 2
    }

    // Quotient score (0-100)
    if (quotient.data?.quotientScore != null) {
      scores.push(Math.min(100, quotient.data.quotientScore));
    }

    // Ethos score (0-2000+, normalize)
    if (ethos.data?.score != null) {
      scores.push(Math.min(100, (ethos.data.score / 1500) * 100));
    }

    // SSA Index (0-100+, cap at 100)
    if (ssa.data != null) {
      scores.push(Math.min(100, ssa.data));
    }

    if (scores.length === 0) return 50; // Default if no scores available
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [talent.data, neynar.data, gitcoin.data, quotient.data, ethos.data, ssa.data]);

  // Calculate engagement score from activity
  const engagementScore = useMemo(() => {
    if (!summary || summary.totalTransactions === 0) return 0;

    let score = 0;

    // Wallet age score (max 2 years = 730 days for full points)
    const ageScore = Math.min(100, (summary.activityPeriodDays / 730) * 100);
    score += ageScore * 0.3; // 30% weight

    // Active days ratio
    const activeDaysRatio = summary.uniqueDaysActive / Math.max(1, summary.activityPeriodDays);
    const activityScore = Math.min(100, activeDaysRatio * 500); // 20% = 100 score
    score += activityScore * 0.3; // 30% weight

    // Recency score (days since last transaction)
    const daysSinceLastTx = summary.lastTxDate
      ? Math.floor((Date.now() - summary.lastTxDate.getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    const recencyScore = daysSinceLastTx <= 7 ? 100 : daysSinceLastTx <= 30 ? 70 : daysSinceLastTx <= 90 ? 40 : 10;
    score += recencyScore * 0.2; // 20% weight

    // Contract interaction ratio (shows DeFi engagement)
    const contractRatio = summary.contractInteractions / Math.max(1, summary.totalTransactions);
    const contractScore = Math.min(100, contractRatio * 200); // 50% contract = 100 score
    score += contractScore * 0.2; // 20% weight

    return Math.round(score);
  }, [summary]);

  // Calculate overall health score
  const overallScore = useMemo(() => {
    // Security: 40%, Reputation: 35%, Engagement: 25%
    const weightedScore =
      securityScore * 0.4 + reputationScore * 0.35 + engagementScore * 0.25;
    return Math.round(weightedScore);
  }, [securityScore, reputationScore, engagementScore]);

  // Generate actionable tips
  const tips = useMemo(() => {
    const tipList: HealthTip[] = [];

    // Security warnings (highest priority)
    for (const flag of flags) {
      tipList.push({
        type: "warning",
        message: `Security Alert: ${flag.label}`,
        priority: 1,
      });
    }

    // Reputation improvements
    if (!gitcoin.data?.passing_score) {
      tipList.push({
        type: "improvement",
        message: "Verify your humanity with Gitcoin Passport to improve reputation",
        priority: 2,
      });
    }

    if (!ssa.hasMinted) {
      tipList.push({
        type: "improvement",
        message: "Mint your SSA SBT to verify your on-chain identity",
        priority: 2,
      });
    }

    if (!talent.data?.builder_score || talent.data.builder_score < 30) {
      tipList.push({
        type: "improvement",
        message: "Build your reputation on Talent Protocol",
        priority: 3,
      });
    }

    if (!neynar.data?.fid) {
      tipList.push({
        type: "improvement",
        message: "Create a Farcaster profile to boost social reputation",
        priority: 3,
      });
    }

    // Engagement tips
    if (summary) {
      const daysSinceLastTx = summary.lastTxDate
        ? Math.floor((Date.now() - summary.lastTxDate.getTime()) / (1000 * 60 * 60 * 24))
        : 365;

      if (daysSinceLastTx > 30) {
        tipList.push({
          type: "info",
          message: `Your wallet has been inactive for ${daysSinceLastTx} days`,
          priority: 2,
        });
      }

      if (summary.uniqueDaysActive < 30) {
        tipList.push({
          type: "improvement",
          message: "Increase on-chain activity to improve engagement score",
          priority: 3,
        });
      }

      const contractRatio = summary.contractInteractions / Math.max(1, summary.totalTransactions);
      if (contractRatio < 0.2) {
        tipList.push({
          type: "info",
          message: "Explore DeFi protocols to diversify your on-chain activity",
          priority: 4,
        });
      }
    }

    // Sort by priority
    return tipList.sort((a, b) => a.priority - b.priority);
  }, [flags, gitcoin.data, ssa.hasMinted, talent.data, neynar.data, summary]);

  const grade = getGrade(overallScore);

  return {
    overallScore,
    grade,
    securityScore,
    reputationScore,
    engagementScore,
    flags,
    tips,
    isLoading: securityLoading || scoresLoading || activityLoading,
    error: securityError || activityError || null,
  };
}

// Export utility functions for UI
export { getGradeColor, getGradeBgColor };
