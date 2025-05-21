// utils/productUtils.ts

export enum PlanType {
  FREE = "FREE",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  LIFETIME = "LIFETIME",
}

export type ProductPlan = {
  name: string;
  description: string;
  price: string;
  priceInCents: number;
  interval: "month" | "year" | "lifetime" | null;
  planType: PlanType;
  polarProductId: string; // Match with Polar's product.id
};

export const PRODUCT_PLANS: ProductPlan[] = [
  {
    name: "Free Drip",
    description: "Try the basics with local-only storage.",
    price: "Free",
    priceInCents: 0,
    interval: null,
    planType: PlanType.FREE,
    polarProductId: "",
  },
  {
    name: "Espresso Pass",
    description: "Monthly access with cloud sync.",
    price: "$9.90 / month",
    priceInCents: 990,
    interval: "month",
    planType: PlanType.MONTHLY,
    polarProductId: "4d25c1fd-d92e-4540-9d28-f05865ea54a9",
  },
  {
    name: "Brewed Annual",
    description: "Save big by subscribing yearly.",
    price: "$58.80 / year ($4.90/month)",
    priceInCents: 5880,
    interval: "year",
    planType: PlanType.YEARLY,
    polarProductId: "026a4e75-717b-4fbb-8bd1-60021514196d", // real Polar ID
  },
  {
    name: "Lifetime Latte",
    description: "One-time purchase, lifetime access.",
    price: "$99 one-time",
    priceInCents: 9900,
    interval: "lifetime",
    planType: PlanType.LIFETIME,
    polarProductId: "1f862cec-9d39-4d06-a17d-38f48aef61aa",
  },
];
