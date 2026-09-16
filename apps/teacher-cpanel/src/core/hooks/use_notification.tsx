"use client";

import { NotificationContext, type NotificationContextType } from "@/app/providers/notification-provider";
import { useContext } from "react";

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
