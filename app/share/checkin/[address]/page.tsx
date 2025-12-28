import { Metadata } from "next";
import { DOMAIN_URL } from "@/config/constants";
import { RedirectToCheckin } from "./redirect-client";

interface PageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const ogImageUrl = `${DOMAIN_URL}/api/og/checkin?address=${address}`;

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
  };
}

export default function ShareCheckinPage() {
  return <RedirectToCheckin />;
}
