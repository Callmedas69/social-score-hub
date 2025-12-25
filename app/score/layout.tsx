import { Metadata } from "next";
import { DOMAIN_URL } from "@/config/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  searchParams: Promise<{ address?: string }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const address = searchParams?.address;

  const title = "Social Score Hub";
  const description =
    "View aggregated social scores from Talent, Gitcoin, Neynar, ETHOS, Quotient, and more.";

  // If address provided, use dynamic OG image
  const ogImage = address
    ? `${DOMAIN_URL}/api/og/score?address=${address}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: "Social Score Hub",
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default function ScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
