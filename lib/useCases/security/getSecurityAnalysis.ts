/**
 * Get Security Analysis Use Case
 *
 * Orchestrates the security analysis workflow:
 * 1. Fetches raw data from repository
 * 2. Extracts flags
 * 3. Calculates score
 * 4. Determines risk level
 */

import { fetchWalletSecurity } from "@/lib/repositories/goPlusRepository";
import { SecurityAnalysisResult } from "./types";
import { extractFlags } from "./extractFlags";
import { calculateSecurityScore } from "./calculateSecurityScore";
import { determineRiskLevel } from "./determineRiskLevel";

/**
 * Get complete security analysis for an address
 *
 * @param address - Ethereum address to analyze
 * @returns Complete security analysis result
 */
export async function getSecurityAnalysis(
  address: string
): Promise<SecurityAnalysisResult> {
  // Fetch raw data from repository
  const rawData = await fetchWalletSecurity(address);

  // Handle case where no data is returned (new address)
  if (!rawData) {
    return {
      isClean: true,
      score: 100,
      riskLevel: "clean",
      flags: [],
      maliciousContractsCreated: 0,
      dataSource: "GoPlus",
    };
  }

  // Extract active flags
  const flags = extractFlags(rawData);

  // Calculate security score
  const score = calculateSecurityScore(flags);

  // Determine risk level
  const riskLevel = determineRiskLevel(flags);

  // Extract malicious contracts count
  const maliciousContractsCreated = parseInt(
    rawData.number_of_malicious_contracts_created || "0",
    10
  );

  return {
    isClean: flags.length === 0,
    score,
    riskLevel,
    flags,
    maliciousContractsCreated,
    dataSource: rawData.data_source || "GoPlus",
  };
}
