import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";
import { Check, Star, Crown } from "lucide-react";
import { PRODUCT_PLANS, PlanType } from "@/infrastructure/config/productsPlan";
import {
  calculateAnnualDiscount,
  isCurrentPlan,
  isYearlyPlan,
  isPopularPlan,
} from "./subscription-utils";

interface AvailablePlansCardProps {
  userPlanType: PlanType;
}

export const AvailablePlansCard = ({
  userPlanType,
}: AvailablePlansCardProps) => {
  const annualDiscount = calculateAnnualDiscount();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Choose Your Plan</CardTitle>
        <CardDescription>
          Select the perfect plan for your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {PRODUCT_PLANS.map((plan) => {
            const isCurrent = isCurrentPlan(plan.planType, userPlanType);
            const isYearly = isYearlyPlan(plan.planType);
            const isPopular = isPopularPlan(plan.planType);

            return (
              <div
                key={plan.planType}
                className={`relative border rounded-lg p-4 transition-all duration-200 h-64 flex flex-col ${
                  isCurrent
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : isYearly
                    ? "border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm hover:shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {/* Popular badge for monthly plan */}
                {isPopular && !isCurrent && (
                  <div className="absolute -top-2 left-3">
                    <Badge className="bg-orange-500 text-white px-2 py-0.5 text-xs">
                      <Star className="w-2 h-2 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}

                {/* Best value badge for yearly plan */}
                {isYearly && (
                  <div className="absolute -top-2 left-3">
                    <Badge className="bg-purple-600 text-white px-2 py-0.5 text-xs">
                      <Crown className="w-2 h-2 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}

                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">
                        {plan.name}
                      </h4>
                      {isCurrent && (
                        <Badge
                          variant="default"
                          className="bg-blue-600 text-xs"
                        >
                          <Check className="w-2 h-2 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {plan.planType === PlanType.FREE
                          ? "$0"
                          : plan.planType === PlanType.MONTHLY
                          ? "$9.90"
                          : plan.planType === PlanType.YEARLY
                          ? "$4.90"
                          : "$99"}
                      </span>
                      {plan.interval && (
                        <span className="text-gray-500 text-sm ml-1">
                          /{" "}
                          {plan.interval === "month"
                            ? "month"
                            : plan.interval === "year"
                            ? "month"
                            : "lifetime"}
                        </span>
                      )}
                    </div>

                    {plan.planType === PlanType.YEARLY && (
                      <div className="text-xs text-purple-600 font-medium">
                        Billed annually at $58.80
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 flex-1">
                    {plan.description}
                  </p>

                  {/* Annual savings */}
                  {isYearly && annualDiscount > 0 && (
                    <div className="bg-green-100 border border-green-200 rounded p-2 mb-3">
                      <div className="text-green-800 font-medium text-xs">
                        💰 Save ${annualDiscount.toFixed(2)}
                      </div>
                      <div className="text-green-600 text-xs">
                        2 months free!
                      </div>
                    </div>
                  )}

                  {/* Button */}
                  <div className="mt-auto">
                    <Button
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      disabled={plan.planType === PlanType.FREE || isCurrent}
                      className={`w-full ${
                        isYearly && !isCurrent
                          ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                          : ""
                      }`}
                    >
                      {isCurrent
                        ? "Current"
                        : plan.planType === PlanType.FREE
                        ? "Free"
                        : "Upgrade"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
