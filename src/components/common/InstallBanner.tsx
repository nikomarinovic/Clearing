import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { storage } from "../../lib/storage";
import { useToast } from "../../hooks/useToast";
import { useAppData } from "../../hooks/useAppData";
import { Button } from "../ui/Button";

const DISMISS_KEY = "clearing_install_banner_dismissed_at";
const REPROMPT_AFTER_MS = 1000 * 60 * 60 * 24 * 7; // don't nag more than once a week

export function InstallBanner({ respectCookieConsent = false }: { respectCookieConsent?: boolean }) {
  const { installed, canPrompt, isIos, promptInstall } = useInstallPrompt();
  const { showToast } = useToast();
  const { data } = useAppData();
  const [dismissed, setDismissed] = useState(true);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    const dismissedAt = storage.get<number>(DISMISS_KEY);
    setDismissed(!!dismissedAt && Date.now() - dismissedAt < REPROMPT_AFTER_MS);
  }, []);

  const dismiss = () => {
    storage.set(DISMISS_KEY, Date.now());
    setDismissed(true);
    setShowIosSteps(false);
  };

  // Inside the app shell the cookie banner uses the same bottom-sheet slot,
  // so wait for that to resolve first; on the marketing landing page the
  // cookie banner never renders, so there's nothing to wait for.
  const cookieBannerClear = !respectCookieConsent || data.settings.cookieConsent !== "unset";
  const visible = !installed && !dismissed && cookieBannerClear && (canPrompt || isIos);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-lg overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] lg:bottom-8"
          role="dialog"
          aria-label="Add Clearing to your home screen"
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-green)] text-white">
              <Download size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-[var(--text)]">Add Clearing to your home screen</p>
              <p className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">
                One tap to open, works full-screen, no browser bar in the way.
              </p>

              {showIosSteps ? (
                <div className="mt-3 flex flex-col gap-1.5 rounded-[12px] bg-[var(--surface-2)]/60 p-3 text-[12.5px] text-[var(--text)]">
                  <p className="flex items-center gap-2">
                    <Share size={13} className="shrink-0 text-[var(--text-muted)]" /> Tap the Share button
                  </p>
                  <p className="flex items-center gap-2">
                    <PlusSquare size={13} className="shrink-0 text-[var(--text-muted)]" /> Then "Add to Home Screen"
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    icon={<Download size={13} />}
                    onClick={async () => {
                      if (isIos) {
                        setShowIosSteps(true);
                        return;
                      }
                      const outcome = await promptInstall();
                      if (outcome === "accepted") {
                        showToast("App installed", "success");
                      } else if (outcome === "dismissed") {
                        dismiss();
                      }
                    }}
                  >
                    Add to Home Screen
                  </Button>
                  <Button size="sm" variant="secondary" onClick={dismiss}>
                    Not now
                  </Button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
