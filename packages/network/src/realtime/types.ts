export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface RealtimeClientConfig {
  url: string;
  path?: string;
  /** since we're cookie-based elsewhere, default this to true so the socket handshake carries the cookie too */
  withCredentials?: boolean;
  auth?: Record<string, unknown> | (() => Record<string, unknown> | Promise<Record<string, unknown>>);
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  transports?: ("websocket" | "polling")[];
  query?: Record<string, string>;
}

export type StatusListener = (status: ConnectionStatus) => void;
export type EventHandler<T = unknown> = (payload: T) => void;