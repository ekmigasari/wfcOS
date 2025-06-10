import React from "react";
import { membershipPlan, PlanType } from "@/infrastructure/config/productsPlan";
import Image from "next/image";
import { Button } from "@/presentation/components/ui/button";

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
        <div className="absolute -top-3 right-40 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Limited: First 100
        </div>
      );
    }
    if (planId === PlanType.YEARLY) {
      return (
        <div className="absolute -top-3 right-46 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
          Best Value
        </div>
      );
    }
    return null;
  };

  const getButton = (planId: PlanType) => {
    const userPlanLevel = planHierarchy[userPlanType];
    const currentPlanLevel = planHierarchy[planId];

    if (userPlanLevel === currentPlanLevel) {
      return (
        <Button variant="ghost" size="sm" disabled>
          Current Plan
        </Button>
      );
    } else if (currentPlanLevel > userPlanLevel) {
      return (
        <Button
          size="sm"
          className="bg-orange-600 hover:bg-orange-700 text-white w-28"
        >
          Upgrade
        </Button>
      );
    } else {
      return (
        <Button size="sm" color="secondary" className="w-28">
          Downgrade
        </Button>
      );
    }
  };

  return (
    <div className="space-y-5 mt-12">
      <p className="text-lg font-bold text-gray-900">Available Plans</p>
      {plans.map((plan) => (
        //Container
        <div key={plan.id} className={`relative h-28 w-fit`}>
          {getBadge(plan.id)}

          {/* main container */}
          <div
            className={`flex h-full rounded-lg border-2 overflow-hidden  ${
              userPlanType === plan.id
                ? "border-none bg-background"
                : plan.id === PlanType.LIFETIME
                ? "border-orange-400"
                : "border-secondary bg-white"
            }`}
          >
            {/* Image Container */}
            <div
              className={`min-w-28 h-full flex items-center justify-center ${plan.bgColor}`}
            >
              <Image
                src={plan.image}
                alt={`${plan.tier} membership`}
                className="max-h-full w-auto object-contain p-4"
                width={128}
                height={128}
              />
            </div>
            {/* Content Container */}
            <div className={`flex-shrink-0 h-full px-3 w-64`}>
              <div className="flex items-center space-x-2 my-0.5">
                <h3 className="text-xl font-bold text-gray-900">{plan.tier}</h3>
              </div>
              <p className="text-sm text-gray-600 ">{plan.title}</p>
              <ul className="text-sm text-gray-700 leading-tight">
                {plan.description.split(" • ").map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>

            {/* Price Container */}
            <div className="flex flex-shrink-0 flex-col items-end justify-center px-2 w-36">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(plan.amount)}
                <span className="text-xs text-gray-600">{plan.interval}</span>
              </div>
              {plan.id === PlanType.LIFETIME && (
                <p className="text-xs text-red-600">Only 24 Left</p>
              )}
              {plan.id === PlanType.YEARLY && (
                <p className="text-xs text-gray-600">
                  <span className=" line-through text-red-600 mr-1 text-sm">
                    $120
                  </span>
                  Get 50% off{" "}
                </p>
              )}
            </div>
            {/* Button Container */}
            <div className=" flex justify-center items-center w-40">
              {getButton(plan.id)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
