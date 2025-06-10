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

export type MembershipCardData = {
  planType: PlanType;
  bgColor: string;
  title: string;
  tier: string;
  price: string;
  image: string;
  description: string;
};

export const PRODUCT_PLANS: ProductPlan[] = [
  {
    name: "Free Drip",
    description: "Try the basics with local-only storage.",
    price: "$0",
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

export const membershipCardConfig: Record<PlanType, MembershipCardData> = {
  [PlanType.FREE]: {
    planType: PlanType.FREE,
    bgColor: "bg-secondary",
    title: "Free Membership",
    tier: "BRONZE",
    price: "$0",
    image: "/images/membership/free_member.webp",
    description: "Basic access to coffee shop atmosphere",
  },
  [PlanType.MONTHLY]: {
    planType: PlanType.MONTHLY,
    bgColor: "bg-gray-700",
    title: "Monthly Membership",
    tier: "SILVER",
    price: "$9/month",
    image: "/images/membership/silver_member.webp",
    description: "Premium features with monthly billing",
  },
  [PlanType.YEARLY]: {
    planType: PlanType.YEARLY,
    bgColor: "bg-amber-500",
    title: "Annual Membership",
    tier: "GOLD",
    price: "$49/year",
    image: "/images/membership/gold_member.webp",
    description: "Best value with annual commitment",
  },
  [PlanType.LIFETIME]: {
    planType: PlanType.LIFETIME,
    bgColor: "bg-emerald-950",
    title: "Lifetime Membership",
    tier: "PLATINUM",
    price: "$99",
    image: "/images/membership/lifetime_member.webp",
    description: "Unlimited access forever",
  },
};

export const membershipPlan = [
  {
    id: PlanType.FREE,
    image: "/images/membership/free_member.webp",
    bgColor: "bg-secondary",
    tier: "BRONZE",
    title: "Free Membership",
    description:
      "Data on local storage only • Have potential to your lose data • Free features only",
    amount: 0,
    currency: "USD",
    interval: "/free",
  },
  {
    id: PlanType.MONTHLY,
    image: "/images/membership/silver_member.webp",
    bgColor: "bg-gray-700",
    tier: "SILVER",
    title: "Monthly Membership",
    description:
      "Save and sync you data in the cloud • Unlock premium features",
    amount: 990,
    currency: "USD",
    interval: "/month",
  },
  {
    id: PlanType.YEARLY,
    image: "/images/membership/gold_member.webp",
    bgColor: "bg-amber-500",
    tier: "GOLD",
    title: "Annual Membership",
    description:
      "Save and sync you data in the cloud • Unlock premium features",
    amount: 5880,
    currency: "USD",
    interval: "/year",
  },
  {
    id: PlanType.LIFETIME,
    image: "/images/membership/lifetime_member.webp",
    bgColor: "bg-emerald-950",
    tier: "PLATINUM",
    title: "Lifetime Membership",
    description:
      "Save and sync you data in the cloud • Unlock premium features",
    amount: 9900,
    currency: "USD",
    interval: "/lifetime",
  },
];
