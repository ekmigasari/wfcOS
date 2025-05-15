import "@/presentation/styles/globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Itim } from "next/font/google";
import { Toaster } from "@/presentation/components/ui/sonner";
import JotaiProvider from "@/providers/JotaiProvider";

const font = Itim({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://workfromcoffee.com"),
  title: "Work from Coffee | Award-Winning app for Focus & Productivity",
  description:
    "Virtual desktop designed for deep focus and remote work productivity. All-in-one workspace with integrated to-do lists, timers, notepads, music, and ambience for distraction-free work.",
  openGraph: {
    images: "/metadata/wfc-og.png",
    title: "Work from Coffee",
    description:
      "Virtual desktop designed for deep focus and remote work productivity. All-in-one workspace with integrated to-do lists, timers, notepads, music, and ambience for distraction-free work.",
    url: "https://workfromcoffee.com",
    siteName: "Work from Coffee",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: "/metadata/wfc-og.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <JotaiProvider>{children}</JotaiProvider>
        <Toaster richColors position="top-center" />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
