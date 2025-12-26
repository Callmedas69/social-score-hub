import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { DOMAIN_URL } from "@/config/constants";

// Load fonts from static directory
function loadFonts(): { interTight: Buffer | null; doto: Buffer | null } {
  try {
    const interTight = readFileSync(path.join(process.cwd(), "static", "InterTight-Bold.ttf"));
    const doto = readFileSync(path.join(process.cwd(), "static", "Doto-Bold.ttf"));
    return { interTight, doto };
  } catch {
    return { interTight: null, doto: null };
  }
}

// Score providers config - 6 scores in 2 rows of 3 (with brand colors matching ScoreCard.tsx)
const PROVIDERS = [
  { key: "talent_builder", label: "Talent Builder", max: "100", bg: "#f3f4f6", border: "#d1d5db", scoreColor: "#1f2937", logo: "/score_provider/Talent_Protocol.jpg" },
  { key: "talent_creator", label: "Talent Creator", max: "100", bg: "#f3f4f6", border: "#d1d5db", scoreColor: "#1f2937", logo: "/score_provider/Talent_Protocol.jpg" },
  { key: "neynar", label: "Neynar", max: "1.0", bg: "#faf5ff", border: "#e9d5ff", scoreColor: "#9333ea", logo: "/score_provider/Neynar_400x400.jpg" },
  { key: "gitcoin", label: "Gitcoin", max: "100", bg: "#ecfdf5", border: "#a7f3d0", scoreColor: "#059669", logo: "/score_provider/human_paspport.jpg" },
  { key: "ethos", label: "ETHOS", max: null, bg: "#f5f5f4", border: "#d6d3d1", scoreColor: "#57534e", logo: "/score_provider/ethos_logo.png" },
  { key: "quotient", label: "Quotient", max: "100", bg: "#fff7ed", border: "#fed7aa", scoreColor: "#ea580c", logo: "/score_provider/Quotient.png" },
];

async function fetchScores(address: string) {
  try {
    // Fetch all scores in parallel
    const [talentRes, neynarRes, gitcoinRes, ethosRes] = await Promise.all([
      fetch(`${DOMAIN_URL}/api/scores/talent/${address}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${DOMAIN_URL}/api/scores/neynar/${address}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${DOMAIN_URL}/api/scores/gitcoin/${address}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${DOMAIN_URL}/api/scores/ethos/${address}`).then((r) =>
        r.ok ? r.json() : null
      ),
    ]);

    // Fetch Quotient if we have FID
    let quotientData = null;
    if (neynarRes?.fid) {
      const quotientRes = await fetch(`${DOMAIN_URL}/api/scores/quotient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fids: [neynarRes.fid] }),
      });
      if (quotientRes.ok) {
        const data = await quotientRes.json();
        quotientData = data.data?.[0];
      }
    }

    return {
      talent_builder: talentRes?.passport?.builder_score ?? null,
      talent_creator: talentRes?.passport?.creator_score ?? null,
      neynar: neynarRes?.user?.neynar_score ?? null,
      gitcoin: gitcoinRes?.passport?.score ?? null,
      ethos: ethosRes?.ethos?.score ?? null,
      quotient: quotientData?.quotientScore ?? null,
      fid: neynarRes?.fid ?? null,
      username: neynarRes?.user?.username ?? null,
    };
  } catch (error) {
    console.error("Error fetching scores:", error);
    return null;
  }
}

function formatScore(value: number | null, max: string | null, key: string): string {
  if (value === null) return "—";
  if (max === "1.0") return value.toFixed(2);
  // Show decimals for gitcoin and quotient
  if (key === "gitcoin" || key === "quotient") return value.toFixed(2);
  return Math.round(value).toString();
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return new Response("Invalid address", { status: 400 });
  }

  const fonts = loadFonts();
  const scores = await fetchScores(address);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "24px",
        }}
      >
        {/* Centered content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "430px",
            height: "100%",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <img
              src={`${DOMAIN_URL}/social_score_hub_logo.svg`}
              width={24}
              height={24}
              style={{ marginRight: "6px" }}
            />
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                fontFamily: "InterTight",
                color: "#111111",
              }}
            >
              SOCIAL SCORE HUB
            </span>
          </div>

          {/* Scores Grid - 2 columns x 3 rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {[0, 1, 2].map((rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", gap: "8px" }}>
                {PROVIDERS.slice(rowIndex * 2, rowIndex * 2 + 2).map((provider) => {
                  const value = scores?.[provider.key as keyof typeof scores] ?? null;
                  const displayValue = formatScore(value as number | null, provider.max, provider.key);
                  const logoUrl = `${DOMAIN_URL}${provider.logo}`;
                  return (
                    <div
                      key={provider.key}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: provider.bg,
                        padding: "10px 12px",
                        flex: 1,
                        border: `1px solid ${provider.border}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
                        <img src={logoUrl} width={14} height={14} style={{ borderRadius: "50%" }} />
                        <span style={{ fontSize: "10px", color: "#6b7280" }}>{provider.label}</span>
                      </div>
                      <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "InterTight", color: value !== null ? provider.scoreColor : "#d1d5db" }}>
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              marginTop: "12px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "Doto",
                color: "#9ca3af",
                letterSpacing: "0",
              }}
            >
              NOT A SCORE - JUST THE SIGNALS
            </span>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <span style={{ fontSize: "9px", color: "#6b7280" }}>
              {scores?.username && `@${scores.username} • `}
              {scores?.fid && `FID: ${scores.fid} • `}
              {shortenAddress(address)}
            </span>
            <img
              src={`${DOMAIN_URL}/chains/Base_lockup_2color.svg`}
              height={12}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 533,
      fonts: [
        ...(fonts.interTight
          ? [
              {
                name: "InterTight",
                data: fonts.interTight,
                weight: 700 as const,
                style: "normal" as const,
              },
            ]
          : []),
        ...(fonts.doto
          ? [
              {
                name: "Doto",
                data: fonts.doto,
                weight: 700 as const,
                style: "normal" as const,
              },
            ]
          : []),
      ],
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
