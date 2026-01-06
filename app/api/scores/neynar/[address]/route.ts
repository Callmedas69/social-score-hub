/**
 * Neynar Farcaster User API Route
 *
 * Transport layer only - validates input and delegates to use case.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";
import { getNeynarUser } from "@/lib/useCases/scores";

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
  if (!process.env.NEYNAR_API_KEY) {
    return NextResponse.json(
      { error: "Neynar API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Delegate to use case
    const result = await getNeynarUser(address);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Neynar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Neynar score" },
      { status: 500 }
    );
  }
}

// Cache for 24 hours
export const revalidate = 86400;
