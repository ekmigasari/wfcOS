"use client";

// import useSWR from "swr";
import { PlanType } from "@/infrastructure/config/productsPlan";

// Import separated components
// import { CurrentPlanCard } from "./CurrentPlanCard";
// import { AvailablePlansCard } from "./AvailablePlansCard";
// import { PaymentHistoryCard } from "./PaymentHistoryCard";
// import { ErrorState, LoadingState, NoDataState } from "./SubscriptionStates";

// Import mock data utilities (for testing)
import { getUserSubscription } from "./subscription-mock-data";
import { MyMembership } from "./MyMembership";
import { NoDataState } from "./SubscriptionStates";
import { AvailablePlans } from "./AvailablePlans";

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

  const data = getUserSubscription;

  // Handle different states
  // if (error) {
  //   console.error("Error fetching user settings:", error);
  //   return <ErrorState />;
  // }

  // if (isLoading) {
  //   return <LoadingState />;
  // }

  if (!data) {
    return <NoDataState />;
  }

  // const isActive = data.user.planType !== PlanType.FREE;

  // // Extract subscription data
  // const currentSubscription =
  //   data.subscriptions?.find((sub) => sub.status === "ACTIVE") ||
  //   data.subscriptions?.[0];
  // const hasActiveSubscription = currentSubscription?.status === "ACTIVE";

  return (
    <div className="mx-auto">
      {/* Current Plan Section */}
      {/* <CurrentPlanCard
        planType={data.planType}
        currentSubscription={currentSubscription}
        hasActiveSubscription={hasActiveSubscription}
      /> */}
      <MyMembership />
      <AvailablePlans userPlanType={data.user.planType as PlanType} />
      {/* Available Plans Section */}
      {/* <AvailablePlansCard userPlanType={data.planType} /> */}

      {/* Payment History Section */}
      {/* <PaymentHistoryCard subscriptions={data.subscriptions || []} /> */}
    </div>
  );
};
