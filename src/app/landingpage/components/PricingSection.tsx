"use client";

import { PRODUCT_PLANS } from "@/infrastructure/config/productsPlan";
import { Button } from "@/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/presentation/components/ui/card";
import { CheckCircle } from "lucide-react";

// Helper component for pricing cards - internal to this component
const PricingCard = ({
  plan,
  highlighted,
}: {
  plan: (typeof PRODUCT_PLANS)[0];
  highlighted?: boolean;
}) => (
  <Card
    className={`flex flex-col ${
      highlighted ? "border-primary shadow-2xl scale-105" : "border-border"
    }`}
  >
    <CardHeader className="items-center text-center">
      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
      <CardDescription className="px-6">{plan.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col items-center text-center">
      <p className="text-4xl font-extrabold my-4">
        {plan.price.includes("/") ? (
          <>
            <span className="text-2xl font-medium text-muted-foreground">
              $
            </span>
            {plan.priceInCents / 100}
            <span className="text-sm font-medium text-muted-foreground">
              {plan.interval === "month" ? "/mo" : "/yr"}
            </span>
          </>
        ) : (
          plan.price
        )}
      </p>
      <ul className="space-y-2 text-muted-foreground mb-6">
        {/* Mock features for pricing plans */}
        <li className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Core Apps
          Access
        </li>
        <li className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Local Storage
        </li>
        {plan.planType !== "FREE" && (
          <li className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Cloud Sync
          </li>
        )}
        {plan.planType === "LIFETIME" && (
          <li className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Lifetime
            Updates
          </li>
        )}
      </ul>
    </CardContent>
    <CardFooter className="mt-auto">
      <Button
        size="lg"
        className="w-full"
        variant={highlighted ? "default" : "outline"}
      >
        {plan.planType === "FREE" ? "Get Started" : "Choose Plan"}
      </Button>
    </CardFooter>
  </Card>
);

export const PricingSection = () => {
  return (
    <section
      id="pricing"
      className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that&apos;s right for you. Get started for free.
          </p>
        </div>
        <div className="grid lg:grid-cols-4 gap-8 items-stretch max-w-6xl mx-auto">
          {PRODUCT_PLANS.map((plan) => (
            <PricingCard
              key={plan.polarProductId || plan.name}
              plan={plan}
              highlighted={plan.planType === "YEARLY"}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
