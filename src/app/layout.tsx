import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "@/styles/globals.css";
import JotaiProvider from "@/components/providers/JotaiProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const font = Itim({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WFC OS",
  description:
    "A minimal virtual desktop on the web, built for productive & vibey work sessions.",
  openGraph: {
    images: "/metadata/wfc-og.png",
  },
  twitter: {
    card: "summary_large_image",
    images: "/metadata/wfc-og.png",
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
