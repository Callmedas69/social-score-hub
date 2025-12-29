import { Metadata } from "next";

// Remove fc:miniapp for share pages to let standard OG tags work
// Farcaster will use og:image from the page's generateMetadata instead
export const metadata: Metadata = {
  other: {
    // Override parent's fc:miniapp with empty to disable miniapp embed on share pages
    "fc:miniapp": "",
  },
};

export default function CheckinShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
