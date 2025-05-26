import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";

export const ErrorState = () => (
  <div className="max-w-4xl mx-auto p-6">
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">
          Error Loading Subscription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-red-600">
          Failed to load subscription data. Please try again later.
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  </div>
);

export const LoadingState = () => (
  <div className="max-w-4xl mx-auto p-6">
    <Card>
      <CardHeader>
        <CardTitle>Loading Subscription Details</CardTitle>
        <CardDescription>
          Please wait while we fetch your subscription information...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const NoDataState = () => (
  <div className="max-w-4xl mx-auto p-6">
    <Card className="border-gray-200 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-gray-800">No Data Available</CardTitle>
        <CardDescription>
          We couldn&apos;t find any subscription data for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            No subscription information found. You may need to sign up for a
            plan.
          </div>
          <Button onClick={() => window.location.reload()}>Refresh Data</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
