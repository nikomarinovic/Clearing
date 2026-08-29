import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { getCardStyle } from "../../lib/cardStyles";
import type { CardStyle } from "../../types";

interface EntranceScreenProps {
  /** The user's chosen card color, so the intro card matches their real one. Falls back sensibly if not loaded yet. */
  cardStyle?: CardStyle;
  /** Respect the in-app "reduced motion" setting in addition to the OS-level preference. */
  reducedMotionPreference?: boolean;
  /** Total time (ms) the splash is shown — the loading bar fills exactly once, over this stretch, so it finishes right as the app hands off. */
  totalDurationMs: number;
}

/**
 * A small, simplified stand-in for the real balance card — enough visual
 * language (rounded rect, gradient, chip, sheen) to read as "the card"
 * without duplicating VirtualCard's full markup for a brief cameo.
 */
function IntroCardGlyph({ cardStyle, still }: { cardStyle?: CardStyle; still: boolean }) {
  const style = getCardStyle(cardStyle);
  return (
    <motion.div
      className="relative h-[108px] w-[172px] overflow-hidden rounded-[16px] sm:h-[120px] sm:w-[190px]"
      style={{ perspective: 900 }}
      animate={
        still
          ? {}
          : {
              rotateY: [0, 3.5, 0, -3.5, 0],
              rotateX: [0, -1.5, 0, 1.5, 0],
            }
      }
      transition={still ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-br ${style.gradient} p-3.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10`}>
        {/* Static sheen — a fixed highlight, not an animation, so nothing flashes. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ background: "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)" }}
          aria-hidden
        />
        <div className="relative flex items-center justify-between">
          <span className="text-[9px] font-semibold tracking-[0.14em] text-white/90">CLEARING</span>
          <Wifi size={12} className="rotate-90 text-white/60" />
        </div>
        <div className="relative h-4 w-6 rounded-[3px]" style={{ background: `linear-gradient(135deg, ${style.chipTint}, ${style.swatch[1]})` }} />
      </div>
    </motion.div>
  );
}

/**
 * The app's entrance sequence — a plain, static background (no ambient
 * glows, no pulsing, nothing that reads as flashing): the brand mark
 * materializes, the card settles into place beneath it, and a single
 * loading bar fills once underneath, finishing right as the app hands off.
 */
export function EntranceScreen({ cardStyle, reducedMotionPreference, totalDurationMs }: EntranceScreenProps) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches || !!reducedMotionPreference);
  }, [reducedMotionPreference]);

  const barDelay = 0.65;
  const barDuration = Math.max(0.4, totalDurationMs / 1000 - barDelay - 0.15);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-6">
        {/* ---- brand mark: blur-to-sharp materialize, once ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.55, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{
            opacity: { duration: 0.5, delay: 0.08 },
            scale: { type: "spring", stiffness: 260, damping: 20, delay: 0.08 },
            filter: { duration: 0.55, delay: 0.08, ease: "easeOut" },
          }}
          className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] text-white shadow-xl"
        >
          <span className="text-[30px] font-bold leading-none">C</span>
        </motion.div>

        {/* ---- the card, materializing and settling into place ---- */}
        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.86, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            opacity: { duration: 0.5, delay: 0.36 },
            y: { type: "spring", stiffness: 210, damping: 22, mass: 0.6, delay: 0.36 },
            scale: { type: "spring", stiffness: 210, damping: 22, mass: 0.6, delay: 0.36 },
            filter: { duration: 0.5, delay: 0.36, ease: "easeOut" },
          }}
        >
          <IntroCardGlyph cardStyle={cardStyle} still={reduced} />
        </motion.div>

        {/* ---- loading bar: fills exactly once, no repeat, no blinking ---- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: barDelay }}
          className="mt-1 h-[3px] w-32 overflow-hidden rounded-full bg-[var(--surface-2)]"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)]"
            initial={{ width: "4%" }}
            animate={{ width: "100%" }}
            transition={{ duration: reduced ? 0 : barDuration, delay: barDelay, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      </div>
    </div>
  );
}
