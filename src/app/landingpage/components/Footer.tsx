"use client";

import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/40">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Image src="/icon.png" alt="wfcOS Logo" width={24} height={24} />
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Work From Coffee OS. All rights
              reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/terms" className="text-sm hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
