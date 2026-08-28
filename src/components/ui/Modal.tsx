import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Focus the first field only *after* the entrance animation finishes.
  // Using the native `autoFocus` attribute instead fires while the sheet is
  // still animating/off-screen, which on mobile browsers opens (and instantly
  // fights) the keyboard and can leave the field unable to receive input
  // until the user taps it manually — sometimes more than once.
  const handleAnimationComplete = () => {
    if (!open) return;
    const field = contentRef.current?.querySelector<HTMLElement>("input, textarea, select");
    field?.focus({ preventScroll: true });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            onAnimationComplete={handleAnimationComplete}
            className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] sm:max-w-md sm:rounded-[28px]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="modal-title" className="text-lg font-semibold text-[var(--text)]">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]"
              >
                <X size={18} />
              </button>
            </div>
            {children}
            {footer && <div className="mt-6 flex gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
