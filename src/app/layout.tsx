import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "@/presentation/styles/globals.css";
import JotaiProvider from "@/providers/JotaiProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const font = Itim({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://workfromcoffee.com"),
  title: "Work from Coffee",
  description:
    "A minimal virtual desktop on the web, built for productive & vibey work sessions.",
  openGraph: {
    images: "/metadata/wfc-og.png",
    title: "Work from Coffee",
    description:
      "A minimal virtual desktop on the web, built for productive & vibey work sessions.",
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
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
