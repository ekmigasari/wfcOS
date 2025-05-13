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
import { Switch } from "@/presentation/components/ui/switch";
import { Separator } from "@/presentation/components/ui/separator";
import { Label } from "@/presentation/components/ui/label";

export const NotificationTab = () => {
  const notificationOptions = [
    { id: "new-features", label: "New features and updates" },
    { id: "account-updates", label: "Account security updates" },
    { id: "subscription", label: "Subscription and billing information" },
    { id: "marketing", label: "Marketing and promotional emails" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose what notifications you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Email Notifications</h3>
          <Separator />

          {notificationOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between py-2"
            >
              <div>
                <Label htmlFor={option.id} className="font-medium">
                  {option.label}
                </Label>
                <p className="text-sm text-gray-500">
                  {option.id === "account-updates"
                    ? "Important security notifications cannot be disabled"
                    : "Receive emails about " + option.label.toLowerCase()}
                </p>
              </div>
              <Switch
                id={option.id}
                defaultChecked={option.id === "account-updates"}
                disabled={option.id === "account-updates"}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Push Notifications</h3>
          <Separator />

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="push-all" className="font-medium">
                Enable push notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive real-time notifications in your browser
              </p>
            </div>
            <Switch id="push-all" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
};
