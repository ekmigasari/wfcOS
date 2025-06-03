import { PlanType } from "./productsPlan";

export interface MembershipCardData {
  planType: PlanType;
  bgColor: string;
  title: string;
  tier: string;
  price: string;
  image: string;
  description: string;
}

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

// Mock user data for demonstration
export const mockUserData = {
  name: "Liam Alexander Carter",
  issuedDate: "May 25, 2025",
  expiresDate: "May 25, 2026",
  planType: PlanType.LIFETIME, // This will be used as the example
};
