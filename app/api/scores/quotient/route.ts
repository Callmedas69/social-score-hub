/**
 * Quotient Reputation Score API Route
 *
 * Transport layer only - validates input and delegates to use case.
 */

import { NextRequest, NextResponse } from "next/server";
import { getQuotientScores } from "@/lib/useCases/scores";

export async function POST(request: NextRequest) {
  // Check for required API key
  if (!process.env.QUOTIENT_API_KEY) {
    return NextResponse.json(
      { error: "Quotient API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { fids } = body;

    // Input validation
    if (!fids || !Array.isArray(fids) || fids.length === 0) {
      return NextResponse.json(
        { error: "FIDs array is required" },
        { status: 400 }
      );
    }

    // Delegate to use case (handles FID validation and limits)
    const result = await getQuotientScores(fids);

    return NextResponse.json(result);
  } catch (error) {
    // Handle validation errors from use case
    if (error instanceof Error && error.message === "No valid FIDs provided") {
      return NextResponse.json(
        { error: "No valid FIDs provided" },
        { status: 400 }
      );
    }

    console.error("Quotient API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Quotient score" },
      { status: 500 }
    );
  }
}

// Cache for 24 hours
export const revalidate = 86400;
