import { Badge } from "@/presentation/components/ui/badge";
import { ISubscription } from "@/application/types";
import { formatDate, getStatusBadgeColor } from "./subscription-utils";

interface PaymentHistoryCardProps {
  subscriptions: ISubscription[];
}

export const PaymentHistoryCard = ({
  subscriptions,
}: PaymentHistoryCardProps) => {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100); // Convert cents to dollars
  };

  return (
    <div className="mt-12 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Payment History</h3>
      </div>

      <div>
        {subscriptions && subscriptions.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.slice(0, 10).map((subscription, index) => (
              <div
                key={subscription.id || index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.name || "Unknown Plan"}
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getStatusBadgeColor(subscription.status)}`}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(subscription.startDate)} -{" "}
                    {subscription.endDate
                      ? formatDate(subscription.endDate)
                      : "Active"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAmount(subscription.amount, subscription.currency)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {subscription.canceledAt &&
                      `Canceled: ${formatDate(subscription.canceledAt)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No payment history found</div>
            <p className="text-sm text-gray-400">
              Your subscription history will appear here once you upgrade to a
              paid plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
