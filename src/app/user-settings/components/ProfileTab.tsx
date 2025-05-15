"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Button } from "@/presentation/components/ui/button";

export const ProfileTab = () => {
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
            {/* Image would be displayed here */}
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
            <Input id="email" type="email" placeholder="Your email" disabled />
            <p className="text-sm text-gray-500">Your email cannot be changed</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="googleId">Google ID</Label>
            <Input id="googleId" placeholder="Connected Google account" disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="createdAt">Account Created</Label>
            <Input id="createdAt" placeholder="January 1, 2023" disabled />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};
