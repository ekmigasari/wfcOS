"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/presentation/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Elevate Your Focus,{" "}
          <span className="text-primary">Supercharge Your Productivity.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Work From Coffee OS is your all-in-one environment designed for deep
          work and peak performance. Minimize distractions and maximize output
          with our suite of integrated tools.
        </p>
        <div className="flex justify-center space-x-4 mb-12">
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href="/dashboard">Try for Free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-lg px-8 py-6"
          >
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
        <div className="relative max-w-5xl mx-auto mt-10">
          <Image
            src="/blog/wfcos.webp"
            alt="Work From Coffee OS Interface"
            width={1200}
            height={750}
            className="rounded-xl shadow-2xl ring-1 ring-black/5"
            priority
          />
          <div className="absolute -bottom-4 -right-4 -z-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="absolute -top-4 -left-4 -z-10 w-40 h-40 bg-secondary/20 blur-3xl rounded-full"></div>
        </div>
      </div>
    </section>
  );
};
