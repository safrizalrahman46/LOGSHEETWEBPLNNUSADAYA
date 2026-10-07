"use client";

import { useState, useEffect } from "react";
import { getPendingDrafts, deleteOfflineDraft } from "@/db/offlineDb";
import { apiClient } from "@/lib/api";

export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refreshPendingCount = async () => {
    try {
      const drafts = await getPendingDrafts();
      setPendingCount(drafts.length);
    } catch {
      // IndexedDB not ready
    }
  };

  const syncPendingDrafts = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    try {
      const drafts = await getPendingDrafts();
      for (const draft of drafts) {
        try {
          await apiClient.post("/wacb/submit-logsheet", draft.payload);
          if (draft.id) {
            await deleteOfflineDraft(draft.id);
          }
          // Safe 300ms delay between batch submissions
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (err) {
          console.error("Failed to sync draft:", draft.local_id, err);
        }
      }
    } finally {
      setIsSyncing(false);
      refreshPendingCount();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingDrafts();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(refreshPendingCount, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isSyncing, pendingCount, syncPendingDrafts, refreshPendingCount };
}
