import { NextResponse } from "next/server";

const domainUrl = process.env.NEXT_PUBLIC_DOMAIN_URL || "http://localhost:3000";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "SIGN_AT_https://www.base.dev/preview?tab=account",
      payload: "SIGN_AT_https://www.base.dev/preview?tab=account",
      signature: "SIGN_AT_https://www.base.dev/preview?tab=account",
    },
    miniapp: {
      version: "1",
      name: "Social Score Hub",
      homeUrl: `${domainUrl}`,
      iconUrl: `${domainUrl}/icon.png`,
      splashImageUrl: `${domainUrl}/splash.png`,
      splashBackgroundColor: "#FFFFFF",
      subtitle: "Your Web3 reputation signals",
      description: "Not a score, just the signals. Your Web3 reputation at a glance.",
      screenshotUrls: [
        `${domainUrl}/screenshots/score.png`,
        `${domainUrl}/screenshots/stats.png`,
        `${domainUrl}/screenshots/ecosystem.png`,
      ],
      primaryCategory: "utility",
      tags: ["web3", "reputation", "base", "onchain", "score"],
      heroImageUrl: `${domainUrl}/og.png`,
      tagline: "Not a score, just the signals",
      ogTitle: "Social Score Hub",
      ogDescription: "Your Web3 reputation at a glance",
      ogImageUrl: `${domainUrl}/og.png`,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
