import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";

type ErrorBoundaryContextValue = {
  reset: () => void;
};

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | undefined>(undefined);

type ErrorBoundaryProps = {
  children: ReactNode;
  onReset: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled error in dashboard UI:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#0f172a",
            color: "#f8fafc",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              borderRadius: "16px",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              background: "#111827",
              padding: "24px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: "24px" }}>Something went wrong</h2>
            <p style={{ margin: "0", fontSize: "14px", lineHeight: 1.6, color: "#cbd5e1" }}>
              The dashboard hit an unexpected error. You can try recovering this section.
            </p>

            {this.state.error ? (
              <pre
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "#fca5a5",
                  textAlign: "left",
                  overflowX: "auto",
                  fontSize: "12px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </pre>
            ) : null}

            <button
              type="button"
              onClick={this.handleReset}
              style={{
                marginTop: "20px",
                border: "none",
                borderRadius: "10px",
                padding: "10px 16px",
                background: "#ef4444",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

type ErrorBoundaryProviderProps = {
  children: ReactNode;
};

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  const [resetKey, setResetKey] = useState(0);

  const reset = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);

  const value = useMemo<ErrorBoundaryContextValue>(() => ({ reset }), [reset]);

  return (
    <ErrorBoundaryContext.Provider value={value}>
      <ErrorBoundary key={resetKey} onReset={reset}>
        {children}
      </ErrorBoundary>
    </ErrorBoundaryContext.Provider>
  );
}

export function useErrorBoundary() {
  const context = useContext(ErrorBoundaryContext);

  if (!context) {
    throw new Error("useErrorBoundary must be used within an ErrorBoundaryProvider");
  }

  return context;
}
