"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";

import { ProfileTab } from "./components/ProfileTab";
import { SubscriptionTab } from "./components/SubscriptionTab";

import { useSession } from "@/infrastructure/lib/auth-client";
import { playSound } from "@/infrastructure/lib/utils";

export const UserSettingsApp = () => {
  const { data: session } = useSession();

  if (!session) {
    return <div>User Unauthorized</div>;
  }

  return (
    <div className="container mx-auto py-4">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger
            value="profile"
            onPointerDown={() => playSound("/sounds/click.mp3")}
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            onPointerDown={() => playSound("/sounds/click.mp3")}
          >
            Subscription
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
