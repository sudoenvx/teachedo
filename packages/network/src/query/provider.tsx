"use client";

import { QueryClientConfig, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { createQueryClient } from "./query-client";

export function QueryProvider({ children, overrides }: { children: ReactNode, overrides?: QueryClientConfig }) {
  const [client] = useState(() => createQueryClient(overrides));

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}