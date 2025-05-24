"use server";

import { auth } from "@/infrastructure/utils/auth";
import { SubscriptionService, UserService } from "@/application/services";
import { PRODUCT_PLANS } from "@/infrastructure/config/productsPlan";
import { redirect } from "next/navigation";

const subscriptionService = new SubscriptionService();
const userService = new UserService();

export async function getSubscriptionData() {
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    if (!session) {
      redirect("/");
    }

    const userId = session.user.id;

    // Get user data
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's subscriptions
    const subscriptions = await subscriptionService.getUserSubscriptions(
      userId
    );
    const activeSubscriptions =
      await subscriptionService.getActiveUserSubscriptions(userId);

    // Get current active subscription (if any)
    const currentSubscription = activeSubscriptions[0] || null;

    // Find the current plan details
    const currentPlan = currentSubscription
      ? PRODUCT_PLANS.find(
          (plan) => plan.polarProductId === currentSubscription.productId
        )
      : PRODUCT_PLANS.find((plan) => plan.planType === user.planType);

    // Create payment history from all subscriptions
    const paymentHistory = subscriptions
      .map((sub) => ({
        date: sub.startDate,
        amount:
          PRODUCT_PLANS.find((plan) => plan.polarProductId === sub.productId)
            ?.priceInCents || 0,
        status: sub.status,
        subscription: sub,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      user,
      currentSubscription,
      currentPlan,
      allPlans: PRODUCT_PLANS,
      paymentHistory,
      hasActiveSubscription: activeSubscriptions.length > 0,
    };
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((mod) => mod.headers()),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify the subscription belongs to the current user
    const subscription = await subscriptionService.getSubscriptionById(
      subscriptionId
    );
    if (!subscription || subscription.userId !== session.user.id) {
      throw new Error("Subscription not found or unauthorized");
    }

    // Cancel the subscription
    await subscriptionService.cancelSubscription(subscriptionId);

    // Sync user plan with remaining subscriptions
    await subscriptionService.syncUserPlanWithSubscription(session.user.id);

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}
