import { motion } from "framer-motion";
import clsx from "clsx";

export function ProgressBar({ value, tone = "green" }: { value: number; tone?: "green" | "blue" | "red" }) {
  const pct = Math.max(0, Math.min(100, value));
  const colorVar = tone === "green" ? "var(--accent-green)" : tone === "blue" ? "var(--accent-blue)" : "var(--accent-red)";
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]")}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: colorVar }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
