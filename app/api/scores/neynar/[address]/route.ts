import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";

const NEYNAR_API_URL =
  "https://api.neynar.com/v2/farcaster/user/bulk-by-address";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Neynar API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${NEYNAR_API_URL}?addresses=${address.toLowerCase()}`,
      {
        headers: {
          "x-api-key": apiKey,
          "x-neynar-experimental": "true",
        },
        next: { revalidate: 86400 }, // 24 hour cache
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();

    // Get first user from the response (keyed by address)
    const users = Object.values(data || {}).flat() as Array<{
      fid?: number;
      username?: string;
      display_name?: string;
      pfp_url?: string;
      experimental?: { neynar_user_score?: number };
    }>;

    const user = users[0];

    if (!user) {
      return NextResponse.json({ user: null, fid: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        fid: user.fid ?? null,
        username: user.username ?? null,
        display_name: user.display_name ?? null,
        pfp_url: user.pfp_url ?? null,
        neynar_score: user.experimental?.neynar_user_score ?? null,
      },
      fid: user.fid ?? null,
    });
  } catch (error) {
    console.error("Neynar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Neynar score" },
      { status: 500 }
    );
  }
}
