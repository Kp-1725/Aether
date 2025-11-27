import { useEffect, useCallback, useRef } from "react";

const NOTIFICATION_PERMISSION_KEY = "decentrachat-notifications-enabled";

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      if (permission === "granted") {
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
        return true;
      }
    }

    return false;
  }, []);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      if (document.hasFocus()) return; // Don't notify if tab is focused

      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    },
    []
  );

  const isEnabled = useCallback(() => {
    return (
      "Notification" in window &&
      Notification.permission === "granted" &&
      localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === "true"
    );
  }, []);

  const disable = useCallback(() => {
    localStorage.removeItem(NOTIFICATION_PERMISSION_KEY);
  }, []);

  return {
    requestPermission,
    sendNotification,
    isEnabled,
    disable,
    permission: permissionRef.current,
  };
}
