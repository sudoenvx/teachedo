import { useEffect, useRef, useState } from "react";
import type { RealtimeClient } from "./socket-client";
import type { ConnectionStatus } from "./types";

/**
 * Subscribes to a socket event for the lifetime of the component.
 * Returns the latest payload received, plus connection status.
 */
export function useRealtimeEvent<T = unknown>(
  client: RealtimeClient,
  event: string,
  options?: { onEvent?: (payload: T) => void }
) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(client.getStatus());
  const onEventRef = useRef(options?.onEvent);
  onEventRef.current = options?.onEvent;

  useEffect(() => {
    const unsubscribeEvent = client.on<T>(event, (payload) => {
      setData(payload);
      onEventRef.current?.(payload);
    });
    const unsubscribeStatus = client.onStatusChange(setStatus);

    return () => {
      unsubscribeEvent();
      unsubscribeStatus();
    };
  }, [client, event]);

  return { data, status };
}

/** Just tracks connection status, e.g. for a "reconnecting..." banner. */
export function useRealtimeStatus(client: RealtimeClient) {
  const [status, setStatus] = useState<ConnectionStatus>(client.getStatus());

  useEffect(() => {
    const unsubscribeStatus = client.onStatusChange(setStatus);

    return () => {
      unsubscribeStatus();
    };
  }, [client]);

  return status;
}