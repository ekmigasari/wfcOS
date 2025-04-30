import { atom } from "jotai";

export interface AppCleanupInfo {
  windowId: string;
  appId: string;
}

// Atom holding a queue of cleanup requests
export const appCleanupQueueAtom = atom<AppCleanupInfo[]>([]);

// Atom to add a cleanup request to the queue
export const addAppCleanupRequestAtom = atom(
  null, // This is a write-only atom
  (get, set, request: AppCleanupInfo) => {
    // Add the new request to the existing queue
    set(appCleanupQueueAtom, (prevQueue) => [...prevQueue, request]);
  }
);

// Atom for a manager component to consume requests relevant to it
export const consumeAppCleanupRequestsAtom = atom(
  null, // This is a write-only atom
  (get, set, consumerAppId: string): AppCleanupInfo[] => {
    const currentQueue = get(appCleanupQueueAtom);
    const relevantRequests: AppCleanupInfo[] = [];
    const remainingRequests: AppCleanupInfo[] = [];

    // Partition the queue
    currentQueue.forEach((req) => {
      if (req.appId === consumerAppId) {
        relevantRequests.push(req);
      } else {
        remainingRequests.push(req);
      }
    });

    // If any requests were found for this consumer, update the queue
    if (relevantRequests.length > 0) {
      set(appCleanupQueueAtom, remainingRequests);
    }

    // Return the requests for the consumer to process
    return relevantRequests;
  }
);
