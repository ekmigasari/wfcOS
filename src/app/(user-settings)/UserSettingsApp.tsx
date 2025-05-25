// import { UserSettingsTabs } from "./components/UserSettingsTabs";
// import { auth } from "@/infrastructure/utils/auth";
// import { headers } from "next/headers";
import { Suspense } from "react";
// import { SubscriptionService } from "@/application/services";

// const subscriptionService = new SubscriptionService();

export default function UserSettingsApp() {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  // // Early return if no session - this should match the logic in getSubscriptionData
  // if (!session) {
  //   return <div>Please login to access this page</div>;
  // }

  // // Fetch subscription data on the server
  // const subscriptionData = subscriptionService.getActiveUserSubscriptions(
  //   session.user.id
  // );

  return (
    <div className="container mx-auto py-4">
      <Suspense fallback={<div>Loading...</div>}>
        {/* <UserSettingsTabs
          session={session}
          subscriptionData={subscriptionData}
        /> */}
      </Suspense>
    </div>
  );
}
