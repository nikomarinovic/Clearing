import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "../../hooks/useAppData";
import { Button } from "../ui/Button";

export function CookieConsent() {
  const { data, updateSettings } = useAppData();
  const status = data.settings.cookieConsent;

  return (
    <AnimatePresence>
      {status === "unset" && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-lg rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)] lg:bottom-8"
          role="dialog"
          aria-label="Cookie preferences"
        >
          <p className="text-[14px] leading-relaxed text-[var(--text)]">
            This app only uses cookies that are strictly necessary to run it. We don't use tracking or
            advertising cookies. See our{" "}
            <Link to="/settings/legal/cookies" className="underline underline-offset-2">
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => updateSettings({ cookieConsent: "accepted" })}>
              Accept
            </Button>
            <Button size="sm" variant="secondary" onClick={() => updateSettings({ cookieConsent: "rejected" })}>
              Reject non-essential
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
