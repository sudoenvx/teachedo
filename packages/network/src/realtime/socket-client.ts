import { io, type Socket } from "socket.io-client";
import type {
  ConnectionStatus,
  EventHandler,
  RealtimeClientConfig,
  StatusListener,
} from "./types";

export class RealtimeClient {
  private socket: Socket | null = null;
  private config: RealtimeClientConfig;
  private status: ConnectionStatus = "idle";
  private statusListeners = new Set<StatusListener>();

  // queue emits made while disconnected, flushed once reconnected
  private pendingEmits: { event: string; payload: unknown }[] = [];

  constructor(config: RealtimeClientConfig) {
    this.config = config;
    if (config.autoConnect ?? true) this.connect();
  }

  async connect() {
    if (this.socket?.connected) return;

    const auth =
      typeof this.config.auth === "function" ? await this.config.auth() : this.config.auth;

    this.setStatus("connecting");

    this.socket = io(this.config.url, {
      path: this.config.path,
      withCredentials: this.config.withCredentials ?? true,
      auth,
      query: this.config.query,
      reconnection: this.config.reconnection ?? true,
      reconnectionAttempts: this.config.reconnectionAttempts ?? Infinity,
      reconnectionDelay: this.config.reconnectionDelay ?? 1000,
      reconnectionDelayMax: this.config.reconnectionDelayMax ?? 10_000,
      transports: this.config.transports ?? ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.setStatus("connected");
      this.flushPendingEmits();
    });

    this.socket.on("disconnect", () => this.setStatus("disconnected"));
    this.socket.on("reconnect_attempt", () => this.setStatus("reconnecting"));
    this.socket.on("connect_error", () => this.setStatus("error"));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.setStatus("disconnected");
  }

  /** Update auth (e.g. after token refresh) and reconnect. */
  async updateAuth(auth: Record<string, unknown>) {
    this.config.auth = auth;
    if (this.socket) {
      this.socket.auth = auth;
      this.socket.disconnect().connect();
    }
  }

    on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
        this.socket?.on(event, handler as (...args: unknown[]) => void);
        return () => this.socket?.off(event, handler as (...args: unknown[]) => void);
    }

  off(event: string, handler?: EventHandler) {
    this.socket?.off(event, handler as (...args: unknown[]) => void);
  }

  once<T = unknown>(event: string, handler: EventHandler<T>) {
    this.socket?.once(event, handler as (...args: unknown[]) => void);
  }

  emit(event: string, payload?: unknown) {
    if (!this.socket?.connected) {
      this.pendingEmits.push({ event, payload });
      return;
    }
    this.socket.emit(event, payload);
  }

  /** emit + wait for server ack via socket.io callback */
  emitWithAck<T = unknown>(event: string, payload?: unknown, timeoutMs = 8000): Promise<T> {
    if (!this.socket) return Promise.reject(new Error("Socket not connected"));
    return this.socket.timeout(timeoutMs).emitWithAck(event, payload) as Promise<T>;
  }

  onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  getStatus() {
    return this.status;
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  private flushPendingEmits() {
    const queued = this.pendingEmits.splice(0);
    queued.forEach(({ event, payload }) => this.socket?.emit(event, payload));
  }
}