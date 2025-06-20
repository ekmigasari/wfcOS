"use client";

import useSWR from "swr";
import { userService } from "@/application/services";
import type { UserMembership } from "@/application/types";
import { PlanType } from "@/infrastructure/config/productsPlan";

// Import separated components
import { PaymentHistoryCard } from "./PaymentHistoryCard";
import { LoadingState, NoDataState } from "./SubscriptionStates";
import { AvailablePlans } from "./AvailablePlans";
import { ProductPlans } from "./ProductPlans";
import { MyMembership } from "./MyMembership";
import { Suspense } from "react";

// Remove mock data import since we'll use real data
// import { getUserSubscription } from "./subscription-mock-data";

// Production interface (currently using mock data)
// interface UserWithSubscriptions extends UserProfile {
//   subscriptions: ISubscription[];
// }

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const SubscriptionTab = () => {
  // --- Production SWR fetch ---
  const { data, error, isLoading } = useSWR<UserMembership>(
    "user-membership",
    () => userService.userMembership()
  );

  // Handle different states
  if (error) {
    console.error("Error fetching user membership:", error);
    return <NoDataState />;
  }

  if (isLoading) {
    return <NoDataState />;
  }

  if (!data) {
    return <NoDataState />;
  }
  console.log(data);

  return (
    <div className="mx-auto">
      <Suspense fallback={<LoadingState />}>
        <MyMembership userMembership={data} />
        <ProductPlans userPlanType={data.planType as PlanType} />
        <AvailablePlans userPlanType={data.planType as PlanType} />
      </Suspense>
      <Suspense>
        {/* Payment History Section */}
        <PaymentHistoryCard subscriptions={data.subcriptions} />
      </Suspense>
    </div>
  );
};
