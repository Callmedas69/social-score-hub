// Tier threshold configurations for score providers
// Each tier is defined as { min: threshold, label: display_name }
// Tiers are evaluated in order (highest first)

export interface TierConfig {
  min: number;
  label: string;
}

// Talent Protocol Builder Score tiers
export const TALENT_BUILDER_TIERS: TierConfig[] = [
  { min: 250, label: "Master" },
  { min: 170, label: "Expert" },
  { min: 120, label: "Advanced" },
  { min: 80, label: "Practitioner" },
  { min: 40, label: "Apprentice" },
  { min: 0, label: "Novice" },
];

// Talent Protocol Creator Score tiers
export const TALENT_CREATOR_TIERS: TierConfig[] = [
  { min: 250, label: "Level 6" },
  { min: 170, label: "Level 5" },
  { min: 120, label: "Level 4" },
  { min: 80, label: "Level 3" },
  { min: 40, label: "Level 2" },
  { min: 0, label: "Level 1" },
];

// Quotient tiers (0-1 range)
export const QUOTIENT_TIERS: TierConfig[] = [
  { min: 0.9, label: "Exceptional" },
  { min: 0.8, label: "Elite" },
  { min: 0.75, label: "Influential" },
  { min: 0.6, label: "Active" },
  { min: 0.5, label: "Casual" },
  { min: 0, label: "Inactive" },
];

// Ethos Network credibility levels (0-2800 range, default 1200)
export const ETHOS_TIERS: TierConfig[] = [
  { min: 2600, label: "Renowned" },
  { min: 2400, label: "Revered" },
  { min: 2200, label: "Distinguished" },
  { min: 2000, label: "Exemplary" },
  { min: 1800, label: "Reputable" },
  { min: 1600, label: "Established" },
  { min: 1400, label: "Known" },
  { min: 1200, label: "Neutral" },
  { min: 800, label: "Questionable" },
  { min: 0, label: "Untrusted" },
];

// SSA Index / TrustCheck tiers (0-100 range)
export const SSA_TIERS: TierConfig[] = [
  { min: 90, label: "Legendary" },
  { min: 70, label: "Trusted" },
  { min: 40, label: "Rising Star" },
  { min: 0, label: "Newcomer" },
];

// Generic tier lookup function
export function getTierLabel(score: number | null, tiers: TierConfig[]): string | null {
  if (score === null) return null;
  for (const tier of tiers) {
    if (score >= tier.min) return tier.label;
  }
  return null;
}
