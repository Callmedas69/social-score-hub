/**
 * Ethos Network Score API Route
 *
 * Transport layer only - validates input and delegates to use case.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";
import { getEthosScore } from "@/lib/useCases/scores";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Input validation
  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    // Delegate to use case
    const ethos = await getEthosScore(address);

    return NextResponse.json({ ethos });
  } catch (error) {
    console.error("Ethos API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Ethos score" },
      { status: 500 }
    );
  }
}

// Cache for 24 hours
export const revalidate = 86400;
