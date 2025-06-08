import React from "react";
import { membershipPlan, PlanType } from "@/infrastructure/config/productsPlan";
import Image from "next/image";

interface AvailablePlansProps {
  userPlanType: PlanType;
}

export const AvailablePlans = ({ userPlanType }: AvailablePlansProps) => {
  // 1. Mapping all plan
  // 2. Make Lifetime and Best value different
  // 3. Check Current Plan
  // 4. Make current plan as selected

  const plans = membershipPlan;

  // Define plan hierarchy (higher number = higher tier)
  const planHierarchy: Record<PlanType, number> = {
    [PlanType.FREE]: 0,
    [PlanType.MONTHLY]: 1,
    [PlanType.YEARLY]: 2,
    [PlanType.LIFETIME]: 3,
  };

  const formatPrice = (amount: number) => {
    if (amount === 0) return "$0";
    return `$${(amount / 100).toFixed(amount % 100 === 0 ? 0 : 2)}`;
  };

  const getBadge = (planId: PlanType) => {
    if (planId === PlanType.LIFETIME) {
      return (
        <div className="absolute -top-2 -right-2 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Limited First 100 Offer
        </div>
      );
    }
    if (planId === PlanType.YEARLY) {
      return (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Best value 50% discount
        </div>
      );
    }
    return null;
  };

  const getButtonText = (planId: PlanType) => {
    const userPlanLevel = planHierarchy[userPlanType];
    const currentPlanLevel = planHierarchy[planId];

    if (userPlanLevel === currentPlanLevel) {
      return "Current Plan";
    } else if (currentPlanLevel > userPlanLevel) {
      return "Upgrade";
    } else {
      return "Downgrade";
    }
  };

  const getButtonStyle = (planId: PlanType) => {
    const userPlanLevel = planHierarchy[userPlanType];
    const currentPlanLevel = planHierarchy[planId];

    if (userPlanLevel === currentPlanLevel) {
      // Current plan - gray/disabled style
      return "bg-gray-600 hover:bg-gray-700 text-white";
    } else if (currentPlanLevel > userPlanLevel) {
      // Upgrade - use plan-specific colors
      switch (planId) {
        case PlanType.LIFETIME:
          return "bg-orange-600 hover:bg-orange-700 text-white";
        case PlanType.YEARLY:
          return "bg-blue-600 hover:bg-blue-700 text-white";
        case PlanType.MONTHLY:
          return "bg-green-600 hover:bg-green-700 text-white";
        default:
          return "bg-blue-600 hover:bg-blue-700 text-white";
      }
    } else {
      // Downgrade - darker/muted style
      return "bg-gray-800 hover:bg-gray-900 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative rounded-lg border-2 p-6 ${
            plan.id === PlanType.YEARLY
              ? "border-amber-400 bg-amber-50"
              : plan.id === PlanType.LIFETIME
              ? "border-orange-400 bg-orange-50"
              : "border-gray-200 bg-white"
          }`}
        >
          {getBadge(plan.id)}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Image
                  src={plan.image}
                  alt={`${plan.tier} membership`}
                  className="w-16 h-16 rounded-full"
                  width={64}
                  height={64}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.tier}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">{plan.title}</p>
                <ul className="text-sm text-gray-700 mt-2 space-y-1">
                  {plan.description.split(" • ").map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(plan.amount)}
                <span className="text-lg font-normal text-gray-600">
                  {plan.interval}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{plan.priceInfo}</p>
              {plan.id === PlanType.LIFETIME && (
                <p className="text-sm text-red-600 font-semibold">
                  Only 32 Left
                </p>
              )}

              <button
                className={`mt-3 px-6 py-2 rounded-lg font-semibold transition-colors ${getButtonStyle(
                  plan.id
                )}`}
              >
                🛒 {getButtonText(plan.id)}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
