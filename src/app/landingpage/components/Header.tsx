"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/presentation/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/icon.png" alt="wfcOS Logo" width={32} height={32} />
          <span className="font-bold text-xl">Work From Coffee OS</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Pricing
          </Link>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
