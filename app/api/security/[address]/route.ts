import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isValidAddress } from "@/lib/validation";

const GOPLUS_API_URL = "https://api.gopluslabs.io/api/v1";
const BASE_CHAIN_ID = "8453";

// Generate GoPlus auth signature
function generateGoPlusAuth(): { sign: string; time: string } {
  const appKey = process.env.GOPLUS_APP_KEY || "";
  const appSecret = process.env.GOPLUS_APP_SECRET || "";
  const time = Math.floor(Date.now() / 1000).toString();

  const signString = appKey + time + appSecret;
  const sign = crypto.createHash("sha1").update(signString).digest("hex");

  return { sign, time };
}

// Security flags that indicate risk
const SECURITY_FLAGS = [
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

// Critical flags that should result in 0 security score
const CRITICAL_FLAGS = ["sanctioned", "money_laundering", "cybercrime"];

interface GoPlusResponse {
  code: number;
  message: string;
  result: Record<string, string>;
}

interface SecurityFlag {
  flag: string;
  label: string;
  severity: "critical" | "high" | "medium";
}

const FLAG_LABELS: Record<string, { label: string; severity: "critical" | "high" | "medium" }> = {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    // Generate authentication
    const appKey = process.env.GOPLUS_APP_KEY;
    let authParams = "";

    if (appKey) {
      const { sign, time } = generateGoPlusAuth();
      authParams = `&app_key=${appKey}&sign=${sign}&time=${time}`;
    }

    const response = await fetch(
      `${GOPLUS_API_URL}/address_security/${address}?chain_id=${BASE_CHAIN_ID}${authParams}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // 1 hour cache
      }
    );

    if (!response.ok) {
      throw new Error(`GoPlus API error: ${response.status}`);
    }

    const data: GoPlusResponse = await response.json();

    // GoPlus returns code 1 for success, but also code 2 with empty result for new addresses
    if (data.code !== 1 && data.code !== 2) {
      console.error("GoPlus API response:", JSON.stringify(data));
      throw new Error(`GoPlus error: ${data.message}`);
    }

    const result = data.result || {};

    // Detect active flags
    const activeFlags: SecurityFlag[] = [];
    let hasCriticalFlag = false;

    for (const flag of SECURITY_FLAGS) {
      if (result[flag] === "1") {
        const flagInfo = FLAG_LABELS[flag];
        activeFlags.push({
          flag,
          label: flagInfo.label,
          severity: flagInfo.severity,
        });
        if (CRITICAL_FLAGS.includes(flag)) {
          hasCriticalFlag = true;
        }
      }
    }

    // Calculate security score
    let securityScore = 100;
    if (hasCriticalFlag) {
      securityScore = 0;
    } else {
      // Each non-critical flag reduces score by 15
      securityScore = Math.max(0, 100 - activeFlags.length * 15);
    }

    // Determine risk level
    let riskLevel: "clean" | "low" | "medium" | "high" | "critical";
    if (activeFlags.length === 0) {
      riskLevel = "clean";
    } else if (hasCriticalFlag) {
      riskLevel = "critical";
    } else if (activeFlags.length >= 3) {
      riskLevel = "high";
    } else if (activeFlags.length >= 1) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    // Check malicious contracts created
    const maliciousContractsCount = parseInt(
      result.number_of_malicious_contracts_created || "0",
      10
    );

    return NextResponse.json({
      security: {
        isClean: activeFlags.length === 0,
        score: securityScore,
        riskLevel,
        flags: activeFlags,
        maliciousContractsCreated: maliciousContractsCount,
        dataSource: result.data_source || "GoPlus",
      },
    });
  } catch (error) {
    console.error("GoPlus Security API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security data" },
      { status: 500 }
    );
  }
}
