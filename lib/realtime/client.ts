"use client";

import { useEffect } from "react";
import type { RealtimePayload } from "@/lib/realtime/events";

type Handler = (payload: RealtimePayload) => void;

export function useRealtime(handler: Handler) {
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${window.location.host}/api/realtime`;
    const socket = new WebSocket(url);

    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as RealtimePayload;
        handler(payload);
      } catch {
        // ignore malformed payloads
      }
    });

    return () => {
      socket.close();
    };
  }, [handler]);
}


