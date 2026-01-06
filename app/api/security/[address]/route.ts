/**
 * Security API Route
 *
 * Transport layer only - validates input and delegates to use case.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/validation";
import { getSecurityAnalysis } from "@/lib/useCases/security";

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
    const security = await getSecurityAnalysis(address);

    return NextResponse.json({ security });
  } catch (error) {
    console.error("Security API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security data" },
      { status: 500 }
    );
  }
}

// Cache for 1 hour
export const revalidate = 3600;
