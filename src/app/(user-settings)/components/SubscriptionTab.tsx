"use client";

import useSWR from "swr";
import { PlanType } from "@/infrastructure/config/productsPlan";

// Import separated components
import { CurrentPlanCard } from "./CurrentPlanCard";
import { AvailablePlansCard } from "./AvailablePlansCard";
import { PaymentHistoryCard } from "./PaymentHistoryCard";
import { ErrorState, LoadingState, NoDataState } from "./SubscriptionStates";

// Import mock data utilities (for testing)
import {
  MockUserWithSubscriptions,
  createMockFetcher,
} from "./subscription-mock-data";

// Production interface (currently using mock data)
// interface UserWithSubscriptions extends UserProfile {
//   subscriptions: ISubscription[];
// }

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const SubscriptionTab = () => {
  // --- Production SWR fetch ---
  // const { data, error, isLoading } = useSWR<UserWithSubscriptions>(
  //   `/api/v1/user-settings`,
  //   fetcher
  // );

  // --- MOCK SWR data for testing ---
  // Change this to test different plans: null, PlanType.MONTHLY, PlanType.YEARLY, PlanType.LIFETIME
  const MOCKED_ACTIVE_PLAN = PlanType.MONTHLY; // <--- CHANGE THIS TO TEST DIFFERENT PLANS

  const { data, error, isLoading } = useSWR<MockUserWithSubscriptions>(
    "/api/v1/user-settings-mock",
    createMockFetcher(MOCKED_ACTIVE_PLAN)
  );
  // --- END MOCK SWR ---

  // Handle different states
  if (error) {
    console.error("Error fetching user settings:", error);
    return <ErrorState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!data) {
    return <NoDataState />;
  }

  // Extract subscription data
  const currentSubscription =
    data.subscriptions?.find((sub) => sub.status === "ACTIVE") ||
    data.subscriptions?.[0];
  const hasActiveSubscription = currentSubscription?.status === "ACTIVE";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Current Plan Section */}
      <CurrentPlanCard
        planType={data.planType}
        currentSubscription={currentSubscription}
        hasActiveSubscription={hasActiveSubscription}
      />

      {/* Available Plans Section */}
      <AvailablePlansCard userPlanType={data.planType} />

      {/* Payment History Section */}
      <PaymentHistoryCard subscriptions={data.subscriptions || []} />
    </div>
  );
};
