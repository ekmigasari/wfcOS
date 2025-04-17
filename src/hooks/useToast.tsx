"use client";

import { useState, useCallback, useRef } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
  duration?: number;
}

interface ToastContext {
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export function useToast(): ToastContext {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Use a ref to break the circular dependency
  const dismissRef = useRef<(id: string) => void>(() => {});

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Assign the dismiss function to the ref
  dismissRef.current = dismiss;

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...props };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto dismiss after duration
    if (props.duration !== 0) {
      setTimeout(() => {
        dismissRef.current(id);
      }, props.duration || 5000);
    }
  }, []);

  return { toasts, toast, dismiss };
}

// This is a simple implementation
// In a real app, you might want to use a context provider to make toasts available globally
