import type { Metadata } from "next";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { SocialProofSection } from "./components/SocialProofSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { PricingSection } from "./components/PricingSection";
import { CtaSection } from "./components/CtaSection";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Work From Coffee OS - Supercharge Your Productivity",
  description:
    "Discover Work From Coffee OS, the all-in-one environment for deep work and peak performance. Award-winning platform from Next.js Global Hackathon 2025.",
  keywords:
    "productivity, focus, timer, to-do list, ambience, music player, notepad, bookmark",
  openGraph: {
    title: "Work From Coffee OS - Supercharge Your Productivity",
    description:
      "Discover Work From Coffee OS, the all-in-one environment for deep work and peak performance.",
    images: [
      {
        url: "/blog/wfcos.webp",
        width: 1200,
        height: 630,
        alt: "Work From Coffee OS Interface",
      },
    ],
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <SocialProofSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
