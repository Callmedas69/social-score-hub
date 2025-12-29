import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProviders } from "@/components/providers/AppProviders";
import { APP_NAME, DOMAIN_URL } from "@/config/constants";
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

// Farcaster Mini App embed configuration
const miniAppEmbed = {
  version: "1",
  imageUrl: `${DOMAIN_URL}/og.png`,
  button: {
    title: "Your Signals",
    action: {
      type: "launch_miniapp",
      name: APP_NAME,
      url: DOMAIN_URL,
      splashImageUrl: `${DOMAIN_URL}/splash.png`,
      splashBackgroundColor: "#FFFFFF",
    },
  },
};

export const metadata: Metadata = {
  title: `${APP_NAME} | Not A Score, Just The Signals`,
  description: "Not a score, just the signals ; your Web3 reputation at a glance.",
  appleWebApp: {
    title: "Score Hub",
  },
  openGraph: {
    title: APP_NAME,
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
      <meta name="base:app_id" content="694e92814d3a403912ed80ec" />
      <body
        className={`${baseSans.variable} ${dotoBold.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
