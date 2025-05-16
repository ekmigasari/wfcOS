"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";

export const SubscriptionTab = () => {
  // These would be from props or a data fetching hook in real implementation
  const subscriptionPlans = [
    {
      id: "MONTHLY",
      name: "Monthly",
      price: "$9.99/month",
      description: "Billed monthly",
    },
    {
      id: "YEARLY",
      name: "Yearly",
      price: "$99.99/year",
      description: "Save 16% compared to monthly",
    },
    {
      id: "LIFETIME",
      name: "Lifetime",
      price: "$299",
      description: "One-time payment",
    },
  ];

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
            <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              ACTIVE
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">Premium Plan</p>
          <p className="text-sm text-gray-500 mb-4">Monthly subscription</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Start Date</span>
              <span>Jan 1, 2023</span>
            </div>
            <div className="flex justify-between">
              <span>Next Billing Date</span>
              <span>Feb 1, 2023</span>
            </div>
            <div className="flex justify-between">
              <span>Customer ID</span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                polar_cust_12345678
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Available Plans</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="border rounded-lg p-4 flex flex-col"
              >
                <h4 className="font-medium">{plan.name}</h4>
                <p className="text-xl font-bold">{plan.price}</p>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <Button
                  variant={plan.id === "MONTHLY" ? "default" : "outline"}
                  className="mt-auto"
                >
                  {plan.id === "MONTHLY" ? "Current Plan" : "Switch Plan"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Payment History</h3>
          <div className="text-sm text-gray-500">
            <div className="grid grid-cols-3 font-medium text-gray-700 mb-2">
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            <div className="grid grid-cols-3 mb-1">
              <span>Jan 1, 2023</span>
              <span>$9.99</span>
              <span className="text-green-600">Paid</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Dec 1, 2022</span>
              <span>$9.99</span>
              <span className="text-green-600">Paid</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="text-red-500 hover:text-red-700 mr-2"
        >
          Cancel Subscription
        </Button>
        <Button variant="outline">Update Payment Method</Button>
      </CardFooter>
    </Card>
  );
};
