import {
  PRODUCT_PLANS,
  PlanType,
  ProductPlan,
} from "@/infrastructure/config/productsPlan";
import { ISubscription } from "@/application/types";

// Mock data constants
const MOCK_USER_ID = "user_mock_123";
const MOCK_EMAIL = "test.user@example.com";

// Mock data interface extending UserProfile
export interface MockUserWithSubscriptions {
  id: string;
  email: string;
  name: string;
  planType: PlanType;
  subscriptions: ISubscription[];
  image: string | null;
}

const createMockSubscription = (
  id: string,
  plan: ProductPlan,
  status: ISubscription["status"],
  daysAgoStart: number,
  daysAgoEnd?: number | null,
  daysAgoCanceled?: number | null
): ISubscription => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgoStart);

  let endDate: Date | null = null;
  if (daysAgoEnd) {
    endDate = new Date();
    endDate.setDate(endDate.getDate() - daysAgoEnd);
  }

  let canceledAt: Date | null = null;
  if (daysAgoCanceled) {
    canceledAt = new Date();
    canceledAt.setDate(canceledAt.getDate() - daysAgoCanceled);
  }

  return {
    id: `sub_mock_${id}`,
    productId: plan.polarProductId,
    status,
    startDate,
    endDate,
    canceledAt,
    amount: plan.priceInCents,
    currency: "USD",
  };
};

const MOCK_PLANS = {
  free: PRODUCT_PLANS.find((p) => p.planType === PlanType.FREE)!,
  monthly: PRODUCT_PLANS.find((p) => p.planType === PlanType.MONTHLY)!,
  yearly: PRODUCT_PLANS.find((p) => p.planType === PlanType.YEARLY)!,
  lifetime: PRODUCT_PLANS.find((p) => p.planType === PlanType.LIFETIME)!,
};

export const getMockData = (
  activePlanType: PlanType | null
): MockUserWithSubscriptions => {
  const subscriptions: ISubscription[] = [];
  let userPlanType = PlanType.FREE;

  // Previous expired subscription for history
  subscriptions.push(
    createMockSubscription("expired", MOCK_PLANS.monthly, "EXPIRED", 60, 30)
  );

  if (activePlanType === PlanType.MONTHLY) {
    subscriptions.unshift(
      createMockSubscription("active_monthly", MOCK_PLANS.monthly, "ACTIVE", 15)
    );
    userPlanType = PlanType.MONTHLY;
  } else if (activePlanType === PlanType.YEARLY) {
    subscriptions.unshift(
      createMockSubscription("active_yearly", MOCK_PLANS.yearly, "ACTIVE", 180)
    );
    userPlanType = PlanType.YEARLY;
  } else if (activePlanType === PlanType.LIFETIME) {
    subscriptions.unshift(
      createMockSubscription(
        "active_lifetime",
        MOCK_PLANS.lifetime,
        "ACTIVE",
        300
      )
    );
    userPlanType = PlanType.LIFETIME;
  }

  // Add a canceled subscription to history
  subscriptions.push(
    createMockSubscription(
      "canceled_monthly",
      MOCK_PLANS.monthly,
      "CANCELED",
      90,
      null,
      45
    )
  );

  // Add a very old subscription for pagination testing if needed
  subscriptions.push(
    createMockSubscription(
      "old_free_trial",
      MOCK_PLANS.free,
      "EXPIRED",
      700,
      670
    )
  );

  return {
    id: MOCK_USER_ID,
    email: MOCK_EMAIL,
    name: "Mock User",
    planType: userPlanType,
    subscriptions: subscriptions.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    ), // newest first
    image: null,
  };
};

// Mock data fetcher for SWR
export const createMockFetcher = (activePlanType: PlanType | null) => {
  return () =>
    new Promise<MockUserWithSubscriptions>((resolve) =>
      setTimeout(() => resolve(getMockData(activePlanType)), 500)
    );
};
