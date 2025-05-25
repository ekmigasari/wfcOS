"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import { ProfileTab } from "./components/ProfileTab";
import { SubscriptionTab } from "./components/SubscriptionTab";
import { playSound } from "@/infrastructure/lib/utils";
import { useSessionContext } from "@/providers/SessionProvider";

export default function UserSettingsApp() {
  const session = useSessionContext();

  if (!session) {
    return <div>Please login to access this page</div>;
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
          <ProfileTab data={session} />
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionTab userId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
