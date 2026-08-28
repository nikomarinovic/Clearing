import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Shown while data loads from localStorage (near-instant in practice) and,
 * deliberately, for a beat longer on cold launches — so the app has a
 * proper entrance instead of just popping into view.
 */
export function LoadingScreen() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex h-dvh w-full flex-col items-center justify-center gap-6 bg-[var(--bg)]"
    >
      <motion.div variants={fadeUp} className="relative flex h-24 w-24 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-[28px] border-2 border-[var(--accent-green)]/25"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-[28px] border-2 border-[var(--accent-blue)]/20"
          animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.05 }}
          className="relative flex items-center justify-center rounded-[22px] bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] text-white shadow-xl"
          style={{ height: 72, width: 72 }}
        >
          <motion.span
            className="text-4xl font-bold"
            animate={{ opacity: [1, 0.75, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            C
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col items-center gap-1.5">
        <p className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Clearing</p>
        <p className="text-[12px] font-medium text-[var(--text-faint)]">Getting your numbers ready</p>
      </motion.div>

      <motion.div variants={fadeUp} className="h-1 w-32 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <motion.div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)]"
          animate={{ x: ["-100%", "220%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
