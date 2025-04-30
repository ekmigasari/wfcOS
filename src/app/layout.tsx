import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "@/presentation/styles/globals.css";
import JotaiProvider from "@/providers/JotaiProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { WindowPortalContainer } from "@/presentation/components/shared/window/WindowPortalContainer";

const font = Itim({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://workfromcoffee.com"),
  title: "Work from Coffee",
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
        <JotaiProvider>
          {children}
          {/* Portal container for window isolation */}
          <WindowPortalContainer />
        </JotaiProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
