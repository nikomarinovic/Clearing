import { createContext, useCallback, useRef, useState, type ReactNode } from "react";
import { createId } from "../lib/id";

export interface ToastItem {
  id: string;
  message: string;
  tone: "neutral" | "success" | "warning";
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastItem["tone"]) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastItem["tone"] = "neutral") => {
      const id = createId("toast");
      setToasts((t) => [...t, { id, message, tone }]);
      const timer = setTimeout(() => dismissToast(id), 3200);
      timers.current.set(id, timer);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>{children}</ToastContext.Provider>
  );
}
