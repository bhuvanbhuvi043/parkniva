import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkThara — Space to park. Room to earn.",
  description: "Find a parking space that fits your day. Compare owner-set prices, explore hourly to monthly parking, book standalone EV charging, or share a space or charger of your own with ParkThara.",
  icons: {
    icon: "/images/parkthara-logo.png",
    shortcut: "/images/parkthara-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
