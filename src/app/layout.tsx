import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Flordegrace School",
  description: "The Flordegrace School website is in preparation.",
  // Remove the scaffold-wide exclusion only as part of approved launch work.
  robots: { index: false, follow: false },
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
