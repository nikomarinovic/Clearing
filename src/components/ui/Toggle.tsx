import { motion } from "framer-motion";
import clsx from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * On/off switch, styled after the iOS system switch: a solid, unambiguous
 * "off" track (not a near-invisible outline against the card background)
 * and a thumb that springs across rather than just snapping.
 */
export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full border border-black/5 shadow-inner transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-[var(--accent-green)]" : "bg-[var(--switch-off)]",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="h-[22px] w-[22px] rounded-full bg-white shadow-md ring-1 ring-black/10"
        style={{ marginLeft: checked ? "22px" : "2px" }}
      />
    </button>
  );
}
