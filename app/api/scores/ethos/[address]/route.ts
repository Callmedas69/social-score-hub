import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";

const ETHOS_API_URL = "https://api.ethos.network/api/v2/score/address";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${ETHOS_API_URL}?address=${address.toLowerCase()}`,
      {
        headers: {
          "X-Ethos-Client": "HelloOnchain",
        },
        next: { revalidate: 86400 }, // 24 hour cache
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ ethos: null }, { status: 200 });
      }
      throw new Error(`ETHOS API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      ethos: {
        score: data.score ?? null,
        level: data.level ?? null,
      },
    });
  } catch (error) {
    console.error("ETHOS API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ETHOS score" },
      { status: 500 }
    );
  }
}
