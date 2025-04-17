"use client";

import React from "react";
import { useToast } from "@/hooks/useToast";

interface ResetSystemProps {
  onComplete?: () => void;
}

const ResetSystem: React.FC<ResetSystemProps> = ({ onComplete }) => {
  const { toast } = useToast();

  const resetSystem = () => {
    try {
      // Clear all local storage
      localStorage.clear();

      // Attempt to clear session storage as well
      sessionStorage.clear();

      // If there are other specific items that need to be reset, do it here

      // Notify success
      toast({
        title: "System reset complete",
        description: "All settings have been reset to default",
        variant: "success",
      });

      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }

      // Optional: reload the page to ensure all state is cleared
      window.location.reload();
    } catch (error) {
      console.error("Failed to reset system:", error);
      toast({
        title: "Reset failed",
        description: "There was a problem resetting the system",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">System Reset</h2>
        <p className="mb-6">
          This will reset all settings and data to their default values.
        </p>
        <button
          onClick={resetSystem}
          className="bg-destructive text-white px-4 py-2 rounded hover:bg-destructive/90"
        >
          Reset All Settings
        </button>
      </div>
    </div>
  );
};

export default ResetSystem;
