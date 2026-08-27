import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const icons = {
  success: <CheckCircle2 size={16} className="text-[var(--accent-green)]" />,
  warning: <AlertTriangle size={16} className="text-[var(--accent-amber)]" />,
  neutral: <Info size={16} className="text-[var(--accent-blue)]" />,
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-8">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => dismissToast(toast.id)}
            className="pointer-events-auto flex max-w-sm items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] shadow-[var(--shadow-lg)]"
          >
            {icons[toast.tone]}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
