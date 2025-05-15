"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useEffect } from "react";
import { toast } from "sonner";

export function ToastHandler() {
  const searchParams = useSearchParams();

  const toastShown = useRef(false);

  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    if (status && message && !toastShown.current) {
      if (status === "success") {
        toast.success(message);
      } else {
        toast.error(message || "An error occurred");
      }

      toastShown.current = true;

      //   // Clean the URL by removing the query parameters
      //   // Small timeout to ensure the toast has been triggered before URL change
      // setTimeout(() => {
      //   // Get the current pathname without query parameters
      //   const path = window.location.pathname;
      //   router.replace(path);
      // }, 100);
    }
  }, [searchParams]);

  // This component doesn't render anything visible
  return null;
}
