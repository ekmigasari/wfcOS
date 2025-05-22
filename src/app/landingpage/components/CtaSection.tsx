"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { Zap } from "lucide-react";

export const CtaSection = () => {
  return (
    <section className="py-20 md:py-32 text-center bg-secondary/30">
      <div className="container mx-auto px-4">
        <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
          Ready to Transform Your Workflow?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Join thousands of focused individuals and take control of your
          productivity. Start your free trial today, no credit card required.
        </p>
        <Button size="lg" className="text-xl px-10 py-7" asChild>
          <Link href="/dashboard">Claim Your Free Account</Link>
        </Button>
      </div>
    </section>
  );
};
