import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const baseSans = localFont({
  src: "../assets/base-fonts/baseSans_regular.woff",
  variable: "--font-base-sans",
  display: "swap",
});

const dotoBold = localFont({
  src: "../assets/base-fonts/Doto-Bold.ttf",
  variable: "--font-doto",
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "HELLO ONCHAIN";
const domainUrl = process.env.NEXT_PUBLIC_DOMAIN_URL || "http://localhost:3000";

// Farcaster Mini App embed configuration
const miniAppEmbed = {
  version: "1",
  imageUrl: `${domainUrl}/og.png`,
  button: {
    title: "Your Signals",
    action: {
      type: "launch_frame",
      name: appName,
      url: domainUrl,
      splashImageUrl: `${domainUrl}/splash.png`,
      splashBackgroundColor: "#FFFFFF",
    },
  },
};

export const metadata: Metadata = {
  title: `${appName} | Not A Score, Just The Signals`,
  description: "Not a score, just the signals ; your Web3 reputation at a glance.",
  appleWebApp: {
    title: "Score Hub",
  },
  openGraph: {
    title: appName,
    description: "Not a score, just the signals ; your Web3 reputation at a glance.",
  },
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${baseSans.variable} ${dotoBold.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
