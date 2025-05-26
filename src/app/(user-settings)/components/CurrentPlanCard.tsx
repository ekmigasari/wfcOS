import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { PRODUCT_PLANS, PlanType } from "@/infrastructure/config/productsPlan";
import { ISubscription } from "@/application/types";
import { formatDate, getStatusColor } from "./subscription-utils";

interface CurrentPlanCardProps {
  planType: PlanType;
  currentSubscription?: ISubscription;
  hasActiveSubscription: boolean;
}

export const CurrentPlanCard = ({
  planType,
  currentSubscription,
  hasActiveSubscription,
}: CurrentPlanCardProps) => {
  const currentPlan =
    PRODUCT_PLANS.find((plan) => plan.planType === planType) ||
    PRODUCT_PLANS[0];

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Current Plan
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your active subscription details
            </CardDescription>
          </div>
          <Badge
            variant={hasActiveSubscription ? "default" : "secondary"}
            className={`px-3 py-1 text-sm font-medium ${
              hasActiveSubscription
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {hasActiveSubscription ? "ACTIVE" : "FREE PLAN"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="space-y-4">
            {/* Plan Name */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentPlan.name}
              </h3>
            </div>

            {/* Amount */}
            <div>
              <span className="text-sm font-medium text-gray-500">Amount:</span>
              <div className="text-lg font-semibold text-gray-900">
                {currentPlan.price}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <span className="text-sm font-medium text-gray-500">
                Start Date:
              </span>
              <div className="text-lg text-gray-900">
                {hasActiveSubscription && currentSubscription
                  ? formatDate(currentSubscription.startDate)
                  : "—"}
              </div>
            </div>

            {/* End Date */}
            <div>
              <span className="text-sm font-medium text-gray-500">
                End Date:
              </span>
              <div className="text-lg text-gray-900">
                {hasActiveSubscription && currentSubscription?.endDate
                  ? formatDate(currentSubscription.endDate)
                  : planType === PlanType.LIFETIME
                  ? "Never expires"
                  : "—"}
              </div>
            </div>

            {/* Status */}
            <div>
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <div
                className={`text-lg font-medium ${
                  hasActiveSubscription && currentSubscription
                    ? getStatusColor(currentSubscription.status)
                    : "text-gray-600"
                }`}
              >
                {hasActiveSubscription && currentSubscription
                  ? currentSubscription.status
                  : planType === PlanType.FREE
                  ? "FREE"
                  : "INACTIVE"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
