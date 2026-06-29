import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Tasting Pass",
  description: "Credit wallets and vendor redemption for charity tasting events."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

