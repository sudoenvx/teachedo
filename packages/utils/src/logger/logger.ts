type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerContext {
  tenantId?: string;
  userId?: string;
  [key: string]: unknown;
}

/** Thin leveled logger — swap the `write` internals for Sentry/Datadog/etc per environment. */
class Logger {
  private context: LoggerContext = {};

  withContext(context: LoggerContext): Logger {
    const child = new Logger();
    child.context = { ...this.context, ...context };
    return child;
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.write("debug", message, meta);
  }
  info(message: string, meta?: Record<string, unknown>) {
    this.write("info", message, meta);
  }
  warn(message: string, meta?: Record<string, unknown>) {
    this.write("warn", message, meta);
  }
  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    this.write("error", message, { ...meta, error: this.serializeError(error) });
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const payload = { level, message, ...this.context, ...meta, timestamp: new Date().toISOString() };
    const method = level === "debug" ? "log" : level;
    // eslint-disable-next-line no-console
    console[method](payload);
  }

  private serializeError(error: unknown) {
    if (error instanceof Error) return { name: error.name, message: error.message, stack: error.stack };
    return error;
  }
}

export const logger = new Logger();