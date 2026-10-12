"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildStorageMigrationPayload,
  STORAGE_MIGRATION_ACK_TYPE,
  STORAGE_MIGRATION_TARGET_URL,
  type StorageMigrationAck,
} from "@/infrastructure/utils/storageMigration";
import { Button } from "@/presentation/components/ui/button";

const POST_ATTEMPT_INTERVAL_MS = 700;
const POST_ATTEMPT_TIMEOUT_MS = 15000;

export function StorageMigrationApp() {
  const [status, setStatus] = useState("Your data ready to migrate");
  const [isMigrating, setIsMigrating] = useState(false);
  const retryIntervalRef = useRef<number | null>(null);

  const payload = useMemo(() => buildStorageMigrationPayload(), []);
  const hasMigratableData = payload
    ? Object.keys(payload.storage).length > 0
    : false;

  useEffect(() => {
    const handleAck = (event: MessageEvent<StorageMigrationAck>) => {
      if (event.origin !== STORAGE_MIGRATION_TARGET_URL) return;
      if (event.data?.type !== STORAGE_MIGRATION_ACK_TYPE) return;

      if (retryIntervalRef.current !== null) {
        window.clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }

      setIsMigrating(false);

      if (event.data.success) {
        setStatus(
          `Migration complete. Your data has been copied to ${STORAGE_MIGRATION_TARGET_URL}. You can now continue in os.workfromcoffee.com.`
        );
        return;
      }

      setStatus(
        event.data.error ||
          "The new site rejected the migration payload. Please refresh it and try again."
      );
    };

    window.addEventListener("message", handleAck);
    return () => {
      window.removeEventListener("message", handleAck);
      if (retryIntervalRef.current !== null) {
        window.clearInterval(retryIntervalRef.current);
      }
    };
  }, []);

  const handleMigrate = () => {
    if (!payload) {
      setStatus("Migration is only available in the browser.");
      return;
    }

    const targetWindow = window.navigator.onLine
      ? window.open(STORAGE_MIGRATION_TARGET_URL, "_blank")
      : null;

    if (!targetWindow) {
      setStatus(
        window.navigator.onLine
          ? "Your browser blocked the new tab. Please allow popups and try again."
          : "Migration needs an internet connection to reach the new website."
      );
      return;
    }

    setIsMigrating(true);
    setStatus("Waiting for the new site to receive your local data...");

    const startedAt = Date.now();
    retryIntervalRef.current = window.setInterval(() => {
      if (targetWindow.closed) {
        if (retryIntervalRef.current !== null) {
          window.clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
        setIsMigrating(false);
        setStatus("The new tab was closed before the migration finished.");
        return;
      }

      if (Date.now() - startedAt > POST_ATTEMPT_TIMEOUT_MS) {
        if (retryIntervalRef.current !== null) {
          window.clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
        setIsMigrating(false);
        setStatus(
          "Timed out while sending your data. Keep the new tab open, refresh it, and try again."
        );
        return;
      }

      targetWindow.postMessage(payload, STORAGE_MIGRATION_TARGET_URL);
    }, POST_ATTEMPT_INTERVAL_MS);
  };

  return (
    <div className="flex h-full flex-col justify-between gap-6 bg-background/95 p-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-primary">Migrate Data</h2>
        <p className="max-w-md text-sm leading-6 text-foreground/75">
          Your data from this website will automatically copy to the new
          website. After this, you just need to continue in the new website
          os.workfromcoffee.com.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          className="w-full text-white"
          onClick={handleMigrate}
          disabled={isMigrating || !hasMigratableData}
        >
          {isMigrating ? "Migrating..." : "Migrate Data"}
        </Button>

        <p className="text-sm leading-6 text-foreground/70">{status}</p>
      </div>
    </div>
  );
}
