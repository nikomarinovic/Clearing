import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { haptic } from "../../lib/haptics";
import { useAppData } from "../../hooks/useAppData";

export function FAB({ onClick }: { onClick: () => void }) {
  const { data } = useAppData();
  return (
    <motion.button
      onClick={() => {
        haptic("light", data.settings.hapticsEnabled);
        onClick();
      }}
      aria-label="Add transaction"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
      className="fixed right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-green)] text-white shadow-[0_8px_24px_rgba(111,147,234,0.3)] backdrop-blur-sm lg:hidden"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-white/20"
      />
      <Plus size={28} strokeWidth={2.4} />
    </motion.button>
  );
}
