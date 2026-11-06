import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parkniva — Space to park. Room to earn.",
  description: "Find a parking space that fits your day. Compare owner-set prices, explore hourly to monthly parking, or share a space of your own with Parkniva.",
  icons: {
    icon: "/images/parkniva-logo.png",
    shortcut: "/images/parkniva-logo.png",
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
