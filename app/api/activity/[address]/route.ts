/**
 * Activity API Route
 *
 * Transport layer only - validates input and delegates to use case.
 */

import { NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";
import { getActivitySummary } from "@/lib/useCases/activity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Input validation
  if (!isValidAddress(address)) {
    return NextResponse.json(
      { error: "Invalid address format" },
      { status: 400 }
    );
  }

  // Check for required API key
  if (!process.env.ALCHEMY_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Delegate to use case
    const result = await getActivitySummary(address);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
