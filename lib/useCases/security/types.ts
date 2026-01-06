/**
 * Security Use Case Types
 */

export interface SecurityFlag {
  flag: string;
  label: string;
  severity: "critical" | "high" | "medium";
}

export type RiskLevel = "clean" | "low" | "medium" | "high" | "critical";

export interface SecurityAnalysisResult {
  isClean: boolean;
  score: number;
  riskLevel: RiskLevel;
  flags: SecurityFlag[];
  maliciousContractsCreated: number;
  dataSource: string;
}

// Security flags that GoPlus API returns
export const SECURITY_FLAGS = [
  "cybercrime",
  "money_laundering",
  "phishing_activities",
  "stealing_attack",
  "honeypot_related_address",
  "blackmail_activities",
  "darkweb_transactions",
  "sanctioned",
  "mixer",
  "fake_kyc",
  "malicious_mining_activities",
  "blacklist_doubt",
] as const;

// Critical flags that result in 0 security score
export const CRITICAL_FLAGS = ["sanctioned", "money_laundering", "cybercrime"];

// Human-readable labels for each flag
export const FLAG_LABELS: Record<
  string,
  { label: string; severity: "critical" | "high" | "medium" }
> = {
  cybercrime: { label: "Cybercrime involvement", severity: "critical" },
  money_laundering: { label: "Money laundering", severity: "critical" },
  sanctioned: { label: "Sanctioned address", severity: "critical" },
  phishing_activities: { label: "Phishing activities", severity: "high" },
  stealing_attack: { label: "Theft attacks", severity: "high" },
  honeypot_related_address: { label: "Honeypot/scam tokens", severity: "high" },
  blackmail_activities: { label: "Blackmail activities", severity: "high" },
  darkweb_transactions: { label: "Dark web transactions", severity: "medium" },
  mixer: { label: "Coin mixer usage", severity: "medium" },
  fake_kyc: { label: "Fake KYC involvement", severity: "medium" },
  malicious_mining_activities: { label: "Malicious mining", severity: "medium" },
  blacklist_doubt: { label: "Suspected malicious", severity: "medium" },
};
