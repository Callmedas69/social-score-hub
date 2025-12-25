"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export interface SecurityFlag {
  flag: string;
  label: string;
  severity: "critical" | "high" | "medium";
}

export interface SecurityData {
  isClean: boolean;
  score: number;
  riskLevel: "clean" | "low" | "medium" | "high" | "critical";
  flags: SecurityFlag[];
  maliciousContractsCreated: number;
  dataSource: string;
}

async function fetchSecurityData(address: string): Promise<SecurityData | null> {
  const response = await fetch(`/api/security/${address}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.security;
}

export function useWalletSecurity() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["wallet-security", address],
    queryFn: () => fetchSecurityData(address!),
    enabled: isConnected && !!address,
    staleTime: 60 * 60 * 1000, // 1 hour cache
  });

  return {
    security: data,
    isClean: data?.isClean ?? true,
    score: data?.score ?? 100,
    riskLevel: data?.riskLevel ?? "clean",
    flags: data?.flags ?? [],
    isLoading,
    error,
    refetch,
  };
}
