import { Metadata } from "next";
import { APP_NAME, DOMAIN_URL } from "@/config/constants";
import { RedirectToCheckin } from "./redirect-client";

interface PageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const ogImageUrl = `${DOMAIN_URL}/api/og/checkin?address=${address}`;

  // Dynamic miniapp embed with same image as OG
  const checkinMiniAppEmbed = {
    version: "1",
    imageUrl: ogImageUrl,
    button: {
      title: "Hello Onchain",
      action: {
        type: "launch_miniapp",
        name: APP_NAME,
        url: `${DOMAIN_URL}/checkin`,
        splashImageUrl: `${DOMAIN_URL}/splash.png`,
        splashBackgroundColor: "#FFFFFF",
      },
    },
  };

  return {
    title: "Hello Onchain - Daily Check-in",
    description: "Stack reputation. Catch drops.",
    openGraph: {
      title: "Hello Onchain",
      description: "Daily check-in streak",
      images: [{ url: ogImageUrl, width: 800, height: 418 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(checkinMiniAppEmbed),
    },
  };
}

export default function ShareCheckinPage() {
  return <RedirectToCheckin />;
}
