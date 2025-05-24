"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";

import { ProfileTab } from "./ProfileTab";
import { SubscriptionTab } from "./SubscriptionTab";
import { playSound } from "@/infrastructure/lib/utils";
import { UserSession } from "@/application/types/auth.types";
import { Subscription } from "@/infrastructure/db/prisma/generated";

interface UserSettingsTabsProps {
  session: UserSession;
  subscriptionData: Subscription;
}

export const UserSettingsTabs = ({
  session,
  subscriptionData,
}: UserSettingsTabsProps) => {
  return (
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
        <ProfileTab data={session} />
      </TabsContent>

      {/* Subscription Tab */}
      <TabsContent value="subscription">
        <SubscriptionTab initialData={subscriptionData} />
      </TabsContent>
    </Tabs>
  );
};
