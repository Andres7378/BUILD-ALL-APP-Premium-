import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Texas Home Services Finder",
  description: "Find trusted home service providers across Texas",
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
