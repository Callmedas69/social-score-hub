import { Metadata } from "next";
import { APP_NAME, DOMAIN_URL } from "@/config/constants";

// Checkin-specific Mini App embed configuration
// This overrides the root layout's fc:miniapp to direct users to /checkin
// Note: imageUrl is for the mini app button preview, og:image from page handles link preview
const checkinMiniAppEmbed = {
  version: "1",
  imageUrl: `${DOMAIN_URL}/og.png`,
  button: {
    title: "Hello Onchain",
    action: {
      type: "launch_frame",
      name: APP_NAME,
      url: `${DOMAIN_URL}/checkin`,
      splashImageUrl: `${DOMAIN_URL}/splash.png`,
      splashBackgroundColor: "#FFFFFF",
    },
  },
};

export const metadata: Metadata = {
  other: {
    "fc:miniapp": JSON.stringify(checkinMiniAppEmbed),
  },
};

export default function CheckinShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
