import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, CONTRACT_ABI, DOMAIN_URL, ALCHEMY_RPC_URLS } from "@/config/constants";

// Load fonts
function loadFonts(): { interTight: Buffer | null; doto: Buffer | null } {
  try {
    const interTight = readFileSync(path.join(process.cwd(), "static", "InterTight-Bold.ttf"));
    const doto = readFileSync(path.join(process.cwd(), "static", "Doto-Bold.ttf"));
    return { interTight, doto };
  } catch {
    return { interTight: null, doto: null };
  }
}

// Fetch user stats from contract
async function fetchUserStats(address: `0x${string}`) {
  try {
    const client = createPublicClient({
      chain: base,
      transport: http(ALCHEMY_RPC_URLS[base.id]),
    });

    const stats = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getUserStats",
      args: [address],
    });

    // Returns: [firstCheckIn, lastCheckIn, totalCheckIns, currentStreak, longestStreak]
    const [, , totalCheckIns, currentStreak] = stats as [bigint, bigint, bigint, bigint, bigint];

    return {
      totalCheckIns: Number(totalCheckIns),
      currentStreak: Number(currentStreak),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}

// Fetch user profile from Neynar
async function fetchUserProfile(address: string) {
  try {
    const response = await fetch(`${DOMAIN_URL}/api/scores/neynar/${address}`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      username: data.user?.username ?? null,
      pfp_url: data.user?.pfp_url ?? null,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return new Response("Invalid address", { status: 400 });
  }

  const fonts = loadFonts();
  const [stats, profile] = await Promise.all([
    fetchUserStats(address as `0x${string}`),
    fetchUserProfile(address),
  ]);

  const currentStreak = stats?.currentStreak ?? 0;
  const totalCheckIns = stats?.totalCheckIns ?? 0;
  const pfpUrl = profile?.pfp_url;
  const username = profile?.username;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          paddingTop: "20px",
          paddingBottom: "40px",
          paddingLeft: "100px",
          paddingRight: "100px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: 700,
              fontFamily: "Doto",
              color: "#0000FF",
              letterSpacing: "-2px",
            }}
          >
            HELLO ONCHAIN
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: "48px",
          }}
        >
          {/* PFP */}
          <div
            style={{
              display: "flex",
              width: "200px",
              height: "200px",
              overflow: "hidden",
              backgroundColor: "#e8e8ff",
              border: "1px solid #0000FF",
            }}
          >
            {pfpUrl ? (
              <img
                src={pfpUrl}
                width={200}
                height={200}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "64px",
                  color: "#0000FF",
                }}
              >
                GM
              </div>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "36px",
                fontWeight: 700,
                fontFamily: "InterTight",
                color: "#0000FF",
                
              }}
            >
              {currentStreak}-DAY STREAK 🔥
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                justifyContent: "center",
                color: "#4444FF",
                fontFamily: "InterTight",
              }}
            >
              {totalCheckIns} total check-ins
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <img
                src={`${DOMAIN_URL}/chains/Base_lockup_2color.svg`}
                height={14}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 418,
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
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=86400",
      },
    }
  );
}
