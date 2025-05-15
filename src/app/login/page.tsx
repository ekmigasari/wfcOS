import React from "react";
import { GoogleButton } from "@/presentation/components/ui/google-button";
export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <GoogleButton signUp />
    </div>
  );
}
