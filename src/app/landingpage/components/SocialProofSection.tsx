"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Award, Star } from "lucide-react";

export const SocialProofSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium mb-4">
            <Award className="w-5 h-5 mr-2" /> Award Winning Platform
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Innovators &amp; Achievers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Recognized for excellence at the Next.js Global Hackathon 2025 for
            &quot;Highest Quality App&quot;.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="italic text-muted-foreground mb-4">
                &quot;WFCOS transformed how I approach my remote work. The focus
                tools are a game-changer!&quot;
              </p>
              <div className="flex items-center">
                <Image
                  src="/images/avatars/avatar-1.png"
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">Alex P.</p>
                  <p className="text-sm text-muted-foreground">
                    Freelance Developer
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Testimonial 2 - Hackathon Mention */}
          <Card className="bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <Image
                src="/blog/nextjs-hackathon.webp"
                alt="Next.js Hackathon"
                width={80}
                height={80}
                className="rounded-lg mb-3"
              />
              <p className="italic text-muted-foreground mb-4">
                &quot;Winning &apos;Highest Quality App&apos; at the Next.js
                Hackathon speaks volumes. WFCOS is polished, performant, and a
                joy to use.&quot;
              </p>
              <div className="flex items-center">
                <Image
                  src="/images/avatars/avatar-2.png"
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">
                    Sarah L., Hackathon Judge (Mock)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tech Evangelist
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Testimonial 3 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="italic text-muted-foreground mb-4">
                &quot;The integrated suite of apps keeps me in flow. No more
                context switching!&quot;
              </p>
              <div className="flex items-center">
                <Image
                  src="/images/avatars/avatar-3.png"
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">Mike R.</p>
                  <p className="text-sm text-muted-foreground">
                    Content Creator
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            As featured in the{" "}
            <Link
              href="/blog/post/nextjs-hackathon-2025-deep-dive"
              className="text-primary hover:underline font-medium"
            >
              Next.js Global Hackathon 2025 Deep Dive
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
};
