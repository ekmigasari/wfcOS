"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { PlanType } from "@/infrastructure/config/productsPlan";
import { getSubscriptionData, cancelSubscription } from "../actions";
import { SubscriptionData } from "@/application/types/subscription.types";
import { SubscriptionStatus } from "@/infrastructure/db/prisma/generated";
import { toast } from "sonner";

interface SubscriptionTabProps {
  initialData: SubscriptionData;
}

export const SubscriptionTab = ({ initialData }: SubscriptionTabProps) => {
  const [data, setData] = useState<SubscriptionData>(initialData);
  const [isPending, startTransition] = useTransition();

  const handleCancelSubscription = async () => {
    if (!data?.currentSubscription) return;

    startTransition(async () => {
      try {
        await cancelSubscription(data.currentSubscription!.id);
        toast.success("Subscription canceled successfully");

        // Refresh data
        const updatedData = await getSubscriptionData();
        setData(updatedData);
      } catch (error) {
        console.error("Error canceling subscription:", error);
        toast.error("Failed to cancel subscription");
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case SubscriptionStatus.CANCELED:
        return "bg-red-100 text-red-800";
      case SubscriptionStatus.EXPIRED:
        return "bg-gray-100 text-gray-800";
      case SubscriptionStatus.PAST_DUE:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Details</CardTitle>
        <CardDescription>
          Manage your subscription plan and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Current Plan</h3>
            <div
              className={`px-2 py-1 text-xs rounded-full ${
                data.hasActiveSubscription
                  ? getStatusColor(data.currentSubscription!.status)
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {data.hasActiveSubscription
                ? data.currentSubscription!.status
                : "FREE"}
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">
            {data.currentPlan?.name || "Free Drip"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {data.currentPlan?.description || "Basic plan with local storage"}
          </p>

          <div className="space-y-2 text-sm">
            {data.currentSubscription && (
              <>
                <div className="flex justify-between">
                  <span>Start Date</span>
                  <span>{formatDate(data.currentSubscription.startDate)}</span>
                </div>
                {data.currentSubscription.endDate && (
                  <div className="flex justify-between">
                    <span>End Date</span>
                    <span>{formatDate(data.currentSubscription.endDate)}</span>
                  </div>
                )}
                {data.currentSubscription.canceledAt && (
                  <div className="flex justify-between">
                    <span>Canceled At</span>
                    <span>
                      {formatDate(data.currentSubscription.canceledAt)}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span>Customer ID</span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                {data.user.id}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Available Plans</h3>
          <div className="flex flex-wrap gap-4">
            {data.allPlans.map((plan) => (
              <div
                key={plan.planType}
                className="border rounded-lg p-4 flex flex-col"
              >
                <h4 className="font-medium">{plan.name}</h4>
                <p className="text-xl font-bold">{plan.price}</p>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <Button
                  variant={
                    plan.planType === data.user.planType ? "default" : "outline"
                  }
                  className="mt-auto"
                  disabled={plan.planType === PlanType.FREE}
                >
                  {plan.planType === data.user.planType
                    ? "Current Plan"
                    : plan.planType === PlanType.FREE
                    ? "Free Plan"
                    : "Switch Plan"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {data.paymentHistory.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Payment History</h3>
            <div className="text-sm text-gray-500">
              <div className="grid grid-cols-3 font-medium text-gray-700 mb-2">
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {data.paymentHistory.slice(0, 5).map((payment, index) => (
                <div key={index} className="grid grid-cols-3 mb-1">
                  <span>{formatDate(payment.date)}</span>
                  <span>{formatPrice(payment.amount)}</span>
                  <span
                    className={`capitalize ${
                      payment.status === SubscriptionStatus.ACTIVE
                        ? "text-green-600"
                        : payment.status === SubscriptionStatus.CANCELED
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {payment.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {data.hasActiveSubscription && data.currentSubscription && (
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-700 mr-2"
            onClick={handleCancelSubscription}
            disabled={isPending}
          >
            {isPending ? "Canceling..." : "Cancel Subscription"}
          </Button>
        )}
        <Button variant="outline">Update Payment Method</Button>
      </CardFooter>
    </Card>
  );
};
