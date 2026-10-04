import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://flordegraceschoolinc.com"),
  title: "Flor de Grace School Inc.",
  description:
    "Explore learning, school life, admissions, and news at Flor de Grace School Inc.",
  alternates: { canonical: "/" },
  // Preview and local builds remain out of search until the root launch.
  robots: {
    index: process.env.SITE_INDEXABLE === "true",
    follow: process.env.SITE_INDEXABLE === "true",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-svh font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
