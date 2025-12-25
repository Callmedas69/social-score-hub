import { NextRequest, NextResponse } from "next/server";

const QUOTIENT_API_URL = "https://api.quotient.social/v1/user-reputation";

export async function POST(request: NextRequest) {
  const apiKey = process.env.QUOTIENT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Quotient API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { fids } = body;

    if (!fids || !Array.isArray(fids) || fids.length === 0) {
      return NextResponse.json(
        { error: "FIDs array is required" },
        { status: 400 }
      );
    }

    // Validate each FID is a positive integer
    const validFids = fids.filter(
      (fid): fid is number =>
        typeof fid === "number" && Number.isInteger(fid) && fid > 0
    );

    if (validFids.length === 0) {
      return NextResponse.json(
        { error: "No valid FIDs provided" },
        { status: 400 }
      );
    }

    // Limit to 1000 FIDs per request (API limit)
    const limitedFids = validFids.slice(0, 1000);

    const response = await fetch(QUOTIENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fids: limitedFids,
        api_key: apiKey,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ data: [] }, { status: 200 });
      }
      throw new Error(`Quotient API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      data: data.data || [],
      count: data.count || 0,
    });
  } catch (error) {
    console.error("Quotient API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Quotient score" },
      { status: 500 }
    );
  }
}
