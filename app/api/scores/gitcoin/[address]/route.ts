import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";

const GITCOIN_API_URL = "https://api.passport.xyz/v2/stamps";
const SCORER_ID = process.env.GITCOIN_PASSPORT_SCORER_ID || "11874";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const apiKey = process.env.GITCOIN_PASSPORT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gitcoin Passport API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${GITCOIN_API_URL}/${SCORER_ID}/score/${address}`,
      {
        headers: {
          "X-API-KEY": apiKey,
        },
        next: { revalidate: 86400 }, // 24 hour cache
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ passport: null }, { status: 200 });
      }
      throw new Error(`Gitcoin API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      passport: {
        score: data.score ? parseFloat(data.score) : null,
        passing_score: data.passing_score ?? false,
        threshold: 20,
      },
    });
  } catch (error) {
    console.error("Gitcoin Passport API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Gitcoin score" },
      { status: 500 }
    );
  }
}
