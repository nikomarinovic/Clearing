import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../../lib/format";

export function AnimatedAmount({
  value,
  currency = "EUR",
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  // Count up from 0 on first mount (a nice "reveal" on page entrance), then
  // count from the previous value on any later change.
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(to);
      return;
    }

    const duration = 650;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{formatCurrency(display, currency)}</span>;
}
