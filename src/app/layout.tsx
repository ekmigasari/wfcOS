import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "@/styles/globals.css";
import JotaiProvider from "@/components/providers/JotaiProvider";

const font = Itim({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WFC OS",
  description:
    "A minimal virtual desktop on the web, built for productive & vibey work sessions.",
  openGraph: {
    images: "/wfc-og.png",
  },
  twitter: {
    card: "summary_large_image",
    images: "/wfc-og.png",
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
      </body>
    </html>
  );
}
