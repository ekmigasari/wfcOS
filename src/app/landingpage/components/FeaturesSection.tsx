"use client";

import Image from "next/image";
import { appRegistry } from "@/infrastructure/config/appRegistry";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/presentation/components/ui/card";

export const FeaturesSection = () => {
  const features = Object.values(appRegistry).filter((app) => !app.hidden);

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need, All in One Place
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover a curated selection of applications designed to enhance
            your workflow and maintain your focus.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((app) => (
            <Card key={app.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <Image
                  src={app.src}
                  alt={`${app.name} icon`}
                  width={40}
                  height={40}
                />
                <CardTitle className="text-xl">{app.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  The {app.name} app helps you manage your tasks efficiently.
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
