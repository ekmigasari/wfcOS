import type { Metadata } from "next";
import "@/presentation/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteUrl } from "@/infrastructure/config/site";
import { ServiceWorkerRegistration } from "@/presentation/components/shared/service-worker/ServiceWorkerRegistration";
import JotaiProvider from "@/providers/JotaiProvider";

export const viewport = {
  themeColor: "#2d2417",
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  title: "Work from Coffee | Focus Workspace",
  description:
    "Virtual desktop for deep focus and remote work productivity with integrated to-do lists, timers, notepads, music, and ambience.",
  openGraph: {
    images: "/metadata/wfc-og.png",
    title: "Work from Coffee",
    description:
      "Virtual desktop designed for deep focus and remote work productivity. All-in-one workspace with integrated to-do lists, timers, notepads, music, and ambience for distraction-free work.",
    url: siteUrl,
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
      <body>
        <ServiceWorkerRegistration />
        <JotaiProvider>{children}</JotaiProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
