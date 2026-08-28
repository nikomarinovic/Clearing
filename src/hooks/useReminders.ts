import { useEffect, useMemo, useRef, useState } from "react";
import type { Reminder } from "../types";
import { generateReminders } from "../lib/reminders";
import { todayIso } from "../lib/format";
import { useAppData } from "./useAppData";

export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

async function fireNativeNotification(reminder: Reminder) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    // Prefer the service worker so the notification is a real, persistent
    // system notification — it shows in the OS notification tray/center
    // even if this tab isn't focused, rather than the fragile in-page
    // Notification() constructor (which some mobile browsers block
    // entirely outside a service worker). `.ready` (not `.getRegistration`)
    // waits for the worker to actually be active instead of racing it on
    // first load.
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.ready.catch(() => null) : null;
    if (reg) {
      await reg.showNotification(reminder.title, {
        body: reminder.body,
        tag: reminder.id,
        icon: "/assets/icon-192.png",
        badge: "/assets/icon-192-maskable.png",
      });
      return;
    }
    new Notification(reminder.title, { body: reminder.body, tag: reminder.id });
  } catch {
    // Notifications are a nice-to-have; never let a failure here break the app.
  }
}

// Some reminder kinds are meant to nudge periodically rather than fire once
// and go quiet — they're opt-in, so a repeat notification is wanted, not
// spam. Everything else still fires once per id per session.
const PERIODIC_KINDS = new Set(["daily-checkin", "wish-affordable"]);
const REPEAT_EVERY_MS = 1000 * 60 * 60 * 3; // every ~3 hours while the tab stays open

export function useReminders() {
  const { data, updateSettings } = useAppData();
  const [permission, setPermission] = useState<NotificationPermissionState>(() =>
    typeof Notification === "undefined" ? "unsupported" : (Notification.permission as NotificationPermissionState),
  );
  const firedRef = useRef<Map<string, number>>(new Map());
  const [, setTick] = useState(0);

  const allReminders = useMemo(() => generateReminders(data), [data]);
  // Nudge-style reminders (daily check-in, weekly summary, wish
  // affordability) are push-only — they never sit as a static line in the
  // dashboard UI, only ever fire as a real system notification below.
  const reminders = useMemo(() => allReminders.filter((r) => !r.pushOnly), [allReminders]);

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

  // Some reminder kinds are meant to nudge periodically rather than fire
  // once and go quiet \u2014 they're opt-in, so a repeat notification is
  // wanted, not spam. Everything else still fires once per id per session.

  // Fire native notifications once per reminder per session (in addition to
  // the always-visible in-app list). Info-severity reminders only fire if
  // they're one of the periodic, explicitly opt-in kinds above \u2014
  // everything else needs warning/danger severity so we don't spam the
  // notification tray with low-priority info.
  useEffect(() => {
    if (!data.settings.reminders.pushEnabled || permission !== "granted") return;
    for (const reminder of allReminders) {
      // Genuine warnings (bill due, over budget...) only push at
      // warning/danger severity so we don't spam the tray with routine
      // info. Push-only nudges (daily check-in, weekly summary, wish
      // affordability) are the entire point of pushEnabled, so they always
      // fire regardless of severity — they never show anywhere else.
      if (reminder.severity === "info" && !reminder.pushOnly) continue;

      const isPeriodic = PERIODIC_KINDS.has(reminder.kind);
      const lastFired = firedRef.current.get(reminder.id) ?? 0;
      const dueAgain = isPeriodic && Date.now() - lastFired > REPEAT_EVERY_MS;
      if (lastFired && !dueAgain) continue;

      firedRef.current.set(reminder.id, Date.now());
      void fireNativeNotification(reminder);
    }
  }, [allReminders, data.settings.reminders.pushEnabled, permission]);

  // Re-check periodically so a periodic reminder that's still true gets a
  // fresh chance to re-fire even if nothing else in the app re-rendered.
  useEffect(() => {
    if (!data.settings.reminders.pushEnabled || permission !== "granted") return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000 * 60 * 15);
    return () => clearInterval(interval);
  }, [data.settings.reminders.pushEnabled, permission]);

  return { reminders, permission, requestPermission, dismiss };
}
