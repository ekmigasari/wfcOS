"use client";

import useSWR from "swr";
import { PlanType } from "@/infrastructure/config/productsPlan";
import type { UserMembership } from "@/application/types";

// Import separated components
import { PaymentHistoryCard } from "./PaymentHistoryCard";
import { NoDataState } from "./SubscriptionStates";
import { ProductPlans } from "./ProductPlans";
import { MyMembership } from "./MyMembership";
import { Suspense } from "react";
import Loading from "@/app/loading";

export const SubscriptionTab = ({ userId }: { userId: string }) => {
  // --- Production SWR fetch ---
  const { data, error, isLoading } = useSWR<UserMembership>(
    userId ? `/api/v1/user-membership?userId=${userId}` : null,
    (url: string) => fetch(url).then((r) => r.json())
  );

  // Handle different states
  if (error) {
    console.error("Error fetching user membership:", error);
    return <NoDataState />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return <NoDataState />;
  }

  return (
    <div className="mx-auto">
      <Suspense>
        <MyMembership userMembership={data} />
        <ProductPlans userPlanType={data.planType as PlanType} />
        {/* Payment History Section */}
        <PaymentHistoryCard subscriptions={data.subcriptions} />
      </Suspense>
    </div>
  );
};
