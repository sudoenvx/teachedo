export * from "./socket-client";
export * from "./types";
export * from "./use-realtime";

import { RealtimeClient } from "./socket-client";

export const realtimeClient = new RealtimeClient({
  url: process.env.NEXT_PUBLIC_WS_URL!,
  withCredentials: true
});