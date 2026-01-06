/**
 * Talent Protocol Score API Route
 *
 * Transport layer only - validates input and delegates to use case.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";
import { getTalentScore } from "@/lib/useCases/scores";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Input validation
  if (!isValidAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  // Check for required API key
  if (!process.env.TALENT_PROTOCOL_API_KEY) {
    return NextResponse.json(
      { error: "Talent Protocol API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Delegate to use case
    const passport = await getTalentScore(address);

    return NextResponse.json({ passport });
  } catch (error) {
    console.error("Talent Protocol API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Talent score" },
      { status: 500 }
    );
  }
}

// Cache for 24 hours
export const revalidate = 86400;
