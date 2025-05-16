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

import { useSession } from "@/infrastructure/lib/auth-client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

export const ProfileTab = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
      });
    }
  }, [session]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would update the user profile
    console.log("Submit profile update", formData);
  };

  const saveChanges = () => {
    // This function is used when clicking the button outside the form
    console.log("Submit profile update", formData);
    // Here you would update the user profile
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Manage your personal information and account settings
        </CardDescription>
      </CardHeader>
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
          <Button variant="outline">Change Photo</Button>
        </div>

        <form id="profile-form" onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
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
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveChanges}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};
