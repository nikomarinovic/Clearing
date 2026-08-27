/**
 * Haptic feedback helper. Purely additive: on platforms/browsers without
 * the Vibration API (iOS Safari, desktop) this silently no-ops, so it's
 * always safe to call.
 */
type HapticStyle = "light" | "success" | "warning";

const PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 10,
  success: [12, 40, 12],
  warning: [20, 30, 20, 30, 20],
};

export function haptic(style: HapticStyle = "light", enabled = true): void {
  if (!enabled) return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(PATTERNS[style]);
  } catch {
    // Some browsers throw if called outside a user gesture; never let that
    // break the actual action the user just took.
  }
}
