import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/presentation/components/ui/tabs";
import { ProfileTab, SubscriptionTab } from "./components";
import { Button } from "@/presentation/components/ui/button";
import Link from "next/link";

export default function UserSettings() {
  return (
    <div className="container max-w-5xl mx-auto py-10">
      <div className="flex items-center ">
        <Link href="/">
          <Button variant="outline" className="mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold py-6">User Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
