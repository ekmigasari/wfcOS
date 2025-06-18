import React from "react";
import { membershipPlan, PlanType } from "@/infrastructure/config/productsPlan";
import Image from "next/image";
import { Button } from "@/presentation/components/ui/button";

interface AvailablePlansProps {
  userPlanType: PlanType;
}

export const ProductPlans = ({ userPlanType }: AvailablePlansProps) => {
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
          className="bg-orange-600 hover:bg-orange-700 text-white md:w-28 w-full"
        >
          Upgrade
        </Button>
      );
    } else {
      return (
        <Button size="sm" color="secondary" className="md:w-28 w-full">
          Downgrade
        </Button>
      );
    }
  };

  return (
    <div className="space-y-5 mt-12">
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold text-gray-900">Available Plans</p>
        <a className="text-xs text-blue-500 underline">Detail information</a>
      </div>

      {plans.map((plan) => (
        //Container
        <div key={plan.id} className="md:h-24">
          {/* {getBadge(plan.id)} */}

          {/* main container */}
          <div
            className={`flex h-full rounded-lg border overflow-hidden flex-col md:flex-row justify-between ${
              userPlanType === plan.id
                ? "border-none bg-secondary/10"
                : plan.id === PlanType.LIFETIME
                ? "bg-orange-50 hover:border-orange-400 hover:bg-orange-100"
                : " bg-white hover:bg-gray-50 hover:border-secondary"
            }`}
          >
            {/* Image Container */}
            <div
              className={`min-w-24 h-full flex items-center justify-center ${plan.bgColor}`}
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
            <div
              className={`flex flex-shrink-0 flex-col justify-center h-full px-3 w-44 `}
            >
              <div className="flex gap-2 items-center">
                <h3 className="text-lg font-bold text-gray-900 ">
                  {plan.tier}
                </h3>
                {plan.id === PlanType.LIFETIME && (
                  <div className="flex justify-center shrink-0 items-center bg-red-600 text-white text-[10px] leading-none py-1 h-fit px-2 w-fit rounded-full">
                    Limited Offer
                  </div>
                )}
                {plan.id === PlanType.YEARLY && (
                  <div className="flex justify-center items-center bg-blue-600 text-[10px] text-white leading-none py-1 h-fit px-2 w-fit rounded-full">
                    Best Value
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 capitalize font-light">
                {plan.title}
              </p>
            </div>

            {/* Price Container */}
            <div className="flex flex-shrink-0 flex-col items-center md:items-end justify-center p-2 md:w-30">
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(plan.amount)}
                <span className="text-xs text-gray-600">{plan.interval}</span>
              </div>
              {plan.id === PlanType.LIFETIME && (
                <p className="text-xs text-red-600">Only 24 Left</p>
              )}
              {plan.id === PlanType.YEARLY && (
                <p className="text-xs text-gray-600">
                  <span className=" line-through text-red-600 mr-1 text-lg">
                    $120
                  </span>
                  Get 50% off{" "}
                </p>
              )}
            </div>
            {/* Button Container */}
            <div className=" flex justify-center items-center md:w-40 p-2">
              {getButton(plan.id)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
