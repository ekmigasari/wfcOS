"use client";

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
import { updateUser } from "@/infrastructure/lib/auth-client";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ProfileTabProps } from "@/application/types/auth.types";
import { useRouter } from "next/navigation";

export const ProfileTab = ({ data: session }: ProfileTabProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await updateUser(
      { name },
      {
        onSuccess: () => {
          router.refresh();
          toast.success("User updated successfully");
          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to update profile"
          );
        },
      }
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Manage your personal information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile picture"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-gray-500">Photo</span>
              )}
            </div>
          </div>

          <div id="profile-form" className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                placeholder="Your email"
                disabled
              />
              <p className="text-sm text-gray-500">
                Your email cannot be changed
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="createdAt">Account Created</Label>
              <Input
                id="createdAt"
                value={
                  session?.user?.createdAt
                    ? new Date(session.user.createdAt).toLocaleDateString()
                    : ""
                }
                placeholder="Account creation date"
                disabled
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
