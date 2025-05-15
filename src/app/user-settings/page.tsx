import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Button } from "@/presentation/components/ui/button";
import { Separator } from "@/presentation/components/ui/separator";
import { Switch } from "@/presentation/components/ui/switch";

export default function UserSettings() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Photo</span>
                </div>
                <Button variant="outline">Change Photo</Button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    disabled
                  />
                  <p className="text-sm text-gray-500">
                    Your email cannot be changed
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
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
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">Premium Plan</p>
                <p className="text-sm text-gray-500 mb-4">
                  Monthly subscription
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Start Date</span>
                    <span>Jan 1, 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Billing Date</span>
                    <span>Feb 1, 2023</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Available Plans</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {["Monthly", "Yearly", "Lifetime"].map((plan) => (
                    <div
                      key={plan}
                      className="border rounded-lg p-4 flex flex-col"
                    >
                      <h4 className="font-medium">{plan}</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        {plan === "Monthly"
                          ? "$9.99/month"
                          : plan === "Yearly"
                          ? "$99.99/year"
                          : "$299 one-time"}
                      </p>
                      <Button
                        variant={plan === "Monthly" ? "default" : "outline"}
                        className="mt-auto"
                      >
                        {plan === "Monthly" ? "Current Plan" : "Switch Plan"}
                      </Button>
                    </div>
                  ))}
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
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                <Separator />

                {[
                  "New features",
                  "Account updates",
                  "Subscription renewal",
                  "Marketing emails",
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <span>{item}</span>
                    <Switch id={`notification-${item}`} />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
