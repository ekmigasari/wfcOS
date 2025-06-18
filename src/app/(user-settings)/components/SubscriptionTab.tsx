"use client";

import useSWR from "swr";
import { userService } from "@/application/services";
import type { UserMembership } from "@/application/services/user.service";

// Import separated components
import { PaymentHistoryCard } from "./PaymentHistoryCard";
import { NoDataState } from "./SubscriptionStates";
import { AvailablePlans } from "./AvailablePlans";
import { ProductPlans } from "./ProductPlans";
import { MyMembership } from "./MyMembership";

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

  return (
    <div className="mx-auto">
      <MyMembership membershipData={data} />
      <ProductPlans userPlanType={data.planType} />
      <AvailablePlans userPlanType={data.planType} />

      {/* Payment History Section */}
      <PaymentHistoryCard subscriptions={[]} />
    </div>
  );
};
