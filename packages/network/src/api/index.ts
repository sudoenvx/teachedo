export * from "./client";
export * from "./types";
export * from "./errors";
export * from "./http-method";
export * from "./form-data";

import { ApiClient } from "./client";

export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  withCredentials: true, // secure httpOnly cookie sent automatically
  auth: {
    // only needed if your API *also* wants a header token alongside the cookie
    // headerName: "Authorization",
    // scheme: "Bearer", // or "Token", "JWT", or null for raw token
    // getToken: () => localStorage.getItem("access_token"),
    refresh: async () => {
      await apiClient.post("/auth/refresh", undefined, { skipAuth: true });
    },
    onAuthFailure: () => {
      window.location.href = "/login";
    },
  },
});