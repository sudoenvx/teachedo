import { AnimatePresence } from "motion/react";
import { createContext, type ReactNode, useState } from "react";
import {
  NotificationToast,
  type NotificationProps,
  type NotificationType
} from '@teachedo/ui';

interface NotificationOptions {
  duration?: number;
}

type NotifyFunction = {
  (message: string | undefined | null, type: NotificationType, options?: NotificationOptions): void;
  info: (message: string | undefined | null, options?: NotificationOptions) => void;
  success: (message: string | undefined | null, options?: NotificationOptions) => void;
  error: (message: string | undefined | null, options?: NotificationOptions) => void;
  warning: (message: string | undefined | null, options?: NotificationOptions) => void;
};

interface NotificationContextType {
  notify: NotifyFunction;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


type Notification = Omit<NotificationProps, "onDismiss">;


export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string | undefined | null, type: NotificationType, options?: NotificationOptions) => {
    const newNotification: Notification = {
      id: Date.now(),
      message: message || "",
      type,
      duration: options?.duration,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // create callable function and attach helper methods
  const notifyBase = (message: string | undefined | null, type: NotificationType, options?: NotificationOptions) => {
    addNotification(message, type, options);
  };

  const notify = notifyBase as NotifyFunction;

  // attach helpers; cast type strings as NotificationType to satisfy compiler if NotificationType is a union of those strings
  notify.info = (message: string | undefined | null, options?: NotificationOptions) => notifyBase(message, "info" as NotificationType, options);
  notify.success = (message: string | undefined | null, options?: NotificationOptions) => notifyBase(message, "success" as NotificationType, options);
  notify.error = (message: string | undefined | null, options?: NotificationOptions) => notifyBase(message, "error" as NotificationType, options);
  notify.warning = (message: string | undefined | null, options?: NotificationOptions) => notifyBase(message, "warning" as NotificationType, options);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md space-y-3 px-4">
        <AnimatePresence>
          {notifications.map(n => (
            <NotificationToast key={n.id} {...n} onDismiss={removeNotification} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export {
  NotificationContext,
  type NotificationContextType
}