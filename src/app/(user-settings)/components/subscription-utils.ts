import { PRODUCT_PLANS, PlanType } from "@/infrastructure/config/productsPlan";

// Date formatting utility
export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
};

// Status color utilities
export const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "text-green-600";
    case "TRIALING":
      return "text-blue-600";
    case "CANCELED":
      return "text-red-600";
    case "EXPIRED":
      return "text-gray-600";
    case "PAST_DUE":
      return "text-yellow-600";
    case "INCOMPLETE":
      return "text-orange-600";
    case "INCOMPLETE_EXPIRED":
      return "text-red-500";
    case "UNPAID":
      return "text-red-700";
    default:
      return "text-gray-600";
  }
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "border-green-200 text-green-700 bg-green-50";
    case "TRIALING":
      return "border-blue-200 text-blue-700 bg-blue-50";
    case "CANCELED":
      return "border-red-200 text-red-700 bg-red-50";
    case "EXPIRED":
      return "border-gray-200 text-gray-700 bg-gray-50";
    case "PAST_DUE":
      return "border-yellow-200 text-yellow-700 bg-yellow-50";
    case "INCOMPLETE":
      return "border-orange-200 text-orange-700 bg-orange-50";
    case "INCOMPLETE_EXPIRED":
      return "border-red-200 text-red-700 bg-red-50";
    case "UNPAID":
      return "border-red-300 text-red-800 bg-red-50";
    default:
      return "border-gray-200 text-gray-700 bg-gray-50";
  }
};

// Plan utilities
export const getPlanByProductId = (productId: string) => {
  return PRODUCT_PLANS.find((plan) => plan.polarProductId === productId);
};

export const calculateAnnualDiscount = () => {
  const monthlyPlan = PRODUCT_PLANS.find(
    (plan) => plan.planType === PlanType.MONTHLY
  );
  const yearlyPlan = PRODUCT_PLANS.find(
    (plan) => plan.planType === PlanType.YEARLY
  );

  return monthlyPlan && yearlyPlan
    ? (monthlyPlan.priceInCents * 12 - yearlyPlan.priceInCents) / 100
    : 0;
};

// Plan type checking utilities
export const isPlanType = (planType: PlanType, targetType: PlanType) => {
  return planType === targetType;
};

export const isCurrentPlan = (planType: PlanType, userPlanType: PlanType) => {
  return planType === userPlanType;
};

export const isYearlyPlan = (planType: PlanType) => {
  return planType === PlanType.YEARLY;
};

export const isPopularPlan = (planType: PlanType) => {
  return planType === PlanType.MONTHLY;
};
