import { useEffect, useMemo, useRef, useState } from "react";
import type { Reminder } from "../types";
import { generateReminders } from "../lib/reminders";
import { todayIso } from "../lib/format";
import { useAppData } from "./useAppData";

export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

async function fireNativeNotification(reminder: Reminder) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    // Prefer the service worker so the notification can show even if this
    // tab isn't focused (works while the PWA is installed and running in
    // the background on platforms that support it).
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(reminder.title, {
        body: reminder.body,
        tag: reminder.id,
        icon: "/assets/apple-touch-icon.png",
      });
      return;
    }
    new Notification(reminder.title, { body: reminder.body, tag: reminder.id });
  } catch {
    // Notifications are a nice-to-have; never let a failure here break the app.
  }
}

export function useReminders() {
  const { data, updateSettings } = useAppData();
  const [permission, setPermission] = useState<NotificationPermissionState>(() =>
    typeof Notification === "undefined" ? "unsupported" : (Notification.permission as NotificationPermissionState),
  );
  const firedRef = useRef<Set<string>>(new Set());

  const reminders = useMemo(() => generateReminders(data), [data]);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return "unsupported" as const;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
    if (result === "granted") updateSettings({ reminders: { ...data.settings.reminders, pushEnabled: true } });
    return result;
  };

  const dismiss = (id: string) => {
    const today = todayIso();
    const shownToday = data.settings.reminders.lastShown[today] ?? [];
    if (shownToday.includes(id)) return;
    updateSettings({
      reminders: {
        ...data.settings.reminders,
        lastShown: { ...data.settings.reminders.lastShown, [today]: [...shownToday, id] },
      },
    });
  };

  // Fire native notifications once per reminder per session (in addition to
  // the always-visible in-app list), only for warning/danger severity so we
  // don't spam the notification tray with low-priority info.
  useEffect(() => {
    if (!data.settings.reminders.pushEnabled || permission !== "granted") return;
    for (const reminder of reminders) {
      if (reminder.severity === "info") continue;
      if (firedRef.current.has(reminder.id)) continue;
      firedRef.current.add(reminder.id);
      void fireNativeNotification(reminder);
    }
  }, [reminders, data.settings.reminders.pushEnabled, permission]);

  return { reminders, permission, requestPermission, dismiss };
}
