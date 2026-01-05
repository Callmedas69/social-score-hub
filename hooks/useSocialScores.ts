"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useSSAScore } from "./useSSAScore";

interface TalentPassport {
  builder_score: number | null;
  builder_rank: number | null;
  creator_score: number | null;
  creator_rank: number | null;
}

interface NeynarUser {
  fid: number | null;
  username: string | null;
  display_name: string | null;
  pfp_url: string | null;
  neynar_score: number | null;
}

interface GitcoinPassport {
  score: number | null;
  passing_score: boolean;
  threshold: number;
}

interface QuotientData {
  fid: number;
  username: string;
  quotientScore: number;
  quotientScoreRaw: number;
  quotientRank: number;
  quotientProfileUrl: string;
}

interface EthosData {
  score: number | null;
  level: string | null;
}

async function fetchTalentScore(
  address: string
): Promise<TalentPassport | null> {
  const response = await fetch(`/api/scores/talent/${address}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.passport;
}

async function fetchNeynarScore(
  address: string
): Promise<{ user: NeynarUser | null; fid: number | null }> {
  const response = await fetch(`/api/scores/neynar/${address}`);
  if (!response.ok) return { user: null, fid: null };
  return response.json();
}

async function fetchGitcoinScore(
  address: string
): Promise<GitcoinPassport | null> {
  const response = await fetch(`/api/scores/gitcoin/${address}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.passport;
}

async function fetchQuotientScore(
  fid: number
): Promise<QuotientData | null> {
  const response = await fetch("/api/scores/quotient", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fids: [fid] }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.data?.[0] || null;
}

async function fetchEthosScore(
  address: string
): Promise<EthosData | null> {
  const response = await fetch(`/api/scores/ethos/${address}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.ethos;
}

export function useSocialScores() {
  const { address } = useAccount();
  const { ssaIndex, hasMinted, isLoading: ssaLoading, error: ssaError } = useSSAScore(address);

  // Fetch Talent score
  const {
    data: talent,
    isLoading: talentLoading,
    error: talentError,
  } = useQuery({
    queryKey: ["talent-score", address],
    queryFn: () => fetchTalentScore(address!),
    enabled: !!address,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Fetch Neynar score and FID
  const {
    data: neynarData,
    isLoading: neynarLoading,
    error: neynarError,
  } = useQuery({
    queryKey: ["neynar-score", address],
    queryFn: () => fetchNeynarScore(address!),
    enabled: !!address,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Fetch Gitcoin score
  const {
    data: gitcoin,
    isLoading: gitcoinLoading,
    error: gitcoinError,
  } = useQuery({
    queryKey: ["gitcoin-score", address],
    queryFn: () => fetchGitcoinScore(address!),
    enabled: !!address,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Fetch Quotient score (requires FID from Neynar)
  const fid = neynarData?.fid;
  const {
    data: quotient,
    isLoading: quotientLoading,
    error: quotientError,
  } = useQuery({
    queryKey: ["quotient-score", fid],
    queryFn: () => fetchQuotientScore(fid!),
    enabled: !!fid,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Fetch ETHOS score
  const {
    data: ethos,
    isLoading: ethosLoading,
    error: ethosError,
  } = useQuery({
    queryKey: ["ethos-score", address],
    queryFn: () => fetchEthosScore(address!),
    enabled: !!address,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  return {
    talent: {
      data: talent,
      isLoading: talentLoading,
      error: talentError,
    },
    neynar: {
      data: neynarData?.user,
      fid: neynarData?.fid,
      isLoading: neynarLoading,
      error: neynarError,
    },
    quotient: {
      data: quotient,
      isLoading: quotientLoading || (neynarLoading && !fid),
      error: quotientError,
    },
    ethos: {
      data: ethos,
      isLoading: ethosLoading,
      error: ethosError,
    },
    ssa: {
      data: ssaIndex,
      hasMinted,
      isLoading: ssaLoading,
      error: ssaError,
    },
    gitcoin: {
      data: gitcoin,
      isLoading: gitcoinLoading,
      error: gitcoinError,
    },
    isLoading:
      talentLoading ||
      neynarLoading ||
      gitcoinLoading ||
      quotientLoading ||
      ethosLoading ||
      ssaLoading,
  };
}
