"use client";

import { useRealtime } from "@/lib/realtime/client";
import type { RealtimePayload } from "@/lib/realtime/events";

export function RealtimeListener() {
  useRealtime((payload: RealtimePayload) => {
    // Example handler – extend to update local UI state as needed
    // eslint-disable-next-line no-console
    console.log("Realtime event:", payload.event, payload.data);
  });

  return null;
}


