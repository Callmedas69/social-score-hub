import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";

const TALENT_SCORES_URL = "https://api.talentprotocol.com/scores";

interface TalentScore {
  slug: string;
  points: number;
  rank_position: number | null;
  last_calculated_at: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const apiKey = process.env.TALENT_PROTOCOL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Talent Protocol API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${TALENT_SCORES_URL}?id=${address.toLowerCase()}`,
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
      throw new Error(`Talent API error: ${response.status}`);
    }

    const data = await response.json();
    const scores: TalentScore[] = data.scores || [];

    // Extract builder and creator scores from the array
    const builderScore = scores.find((s) => s.slug === "builder_score");
    const creatorScore = scores.find((s) => s.slug === "creator_score");

    return NextResponse.json({
      passport: {
        builder_score: builderScore?.points ?? null,
        builder_rank: builderScore?.rank_position ?? null,
        creator_score: creatorScore?.points ?? null,
        creator_rank: creatorScore?.rank_position ?? null,
      },
    });
  } catch (error) {
    console.error("Talent Protocol API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Talent score" },
      { status: 500 }
    );
  }
}
