import { Bell, Inbox } from "lucide-react";
import {
  LayoutIconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@teachedo/ui/components";
import {
  NotificationItem,
  type NotificationItemProps,
} from "@teachedo/ui/legacy";

type NotificationsBellProps = {
  notifications?: NotificationItemProps[];
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
};

export function NotificationsBell({
  notifications = [],
  onMarkAllRead,
  onViewAll,
}: NotificationsBellProps) {
  const unreadCount = notifications.filter((n) => n.read === false).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <LayoutIconButton
            aria-label="الإشعارات"
          />
        }
      >
        <Bell className="size-4.5" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold leading-none text-accent-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 border border-border-subtle bg-surface p-0 text-text shadow-elevated"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
          <h2 className="text-[13px] font-bold text-text">الإشعارات</h2>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="text-[10px] text-text-muted">
                {unreadCount} جديدة
              </span>
            )}
            {onMarkAllRead && unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[11px] font-semibold text-primary hover:text-primary-hover"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto p-1.5">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <NotificationItem
                key={notification.timestamp ?? index}
                {...notification}
              />
            ))
          ) : (
            <div className="flex min-h-44 flex-col items-center justify-center gap-2 px-5 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-text-muted">
                <Inbox size={19} strokeWidth={1.7} />
              </span>
              <p className="m-0 text-xs font-semibold text-text">
                لا توجد إشعارات جديدة
              </p>
              <p className="m-0 max-w-52 text-[11px] leading-relaxed text-text-muted">
                سنعرض هنا تحديثات الحساب والتنبيهات المهمة عند وصولها.
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && onViewAll && (
          <div className="border-t border-border-subtle p-1.5">
            <button
              type="button"
              onClick={onViewAll}
              className="w-full rounded-sm py-1.5 text-center text-[11px] font-semibold text-text-muted transition-colors hover:bg-neutral-100 hover:text-text"
            >
              عرض كل الإشعارات
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
