import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Wifi } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import { getCardStyle } from "../../lib/cardStyles";
import type { CardStyle } from "../../types";

interface VirtualCardProps {
  balance: number;
  name: string;
  currency: string;
  cardStyle?: CardStyle;
  signatureUrl?: string;
  /** ISO date the account/profile was created; used to derive a plausible "expires" date. */
  memberSince?: string;
}

/** Decorative only — never a real card/account number, just a card-shaped visual for the balance. */
function maskedNumber(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const last4 = String(hash % 10000).padStart(4, "0");
  return `\u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  \u2022\u2022\u2022\u2022  ${last4}`;
}

/** A plausible "expires" date, four years out from account creation — purely cosmetic, matches real-card conventions. */
function expiryFrom(memberSince: string | undefined): string {
  const base = memberSince ? new Date(memberSince) : new Date();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const year = String((base.getFullYear() + 4) % 100).padStart(2, "0");
  return `${month}/${year}`;
}

/** A realistic EMV-style contact chip: gold foil, six contact pads in the standard layout. */
function Chip() {
  return (
    <svg width="44" height="34" viewBox="0 0 44 34" fill="none" aria-hidden>
      <defs>
        <linearGradient id="chip-gold" x1="0" y1="0" x2="44" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f6e2a0" />
          <stop offset="45%" stopColor="#d9b25f" />
          <stop offset="100%" stopColor="#a97a2e" />
        </linearGradient>
        <linearGradient id="chip-sheen" x1="0" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="43" height="33" rx="6" fill="url(#chip-gold)" stroke="#7a5720" strokeWidth="0.6" />
      {/* contact pad divisions — 2 rows x 3 columns, standard ISO 7816 layout */}
      <rect x="0.5" y="11.5" width="43" height="11" fill="#00000014" />
      <line x1="14.5" y1="0.5" x2="14.5" y2="33.5" stroke="#7a5720" strokeWidth="0.5" opacity="0.6" />
      <line x1="29.5" y1="0.5" x2="29.5" y2="33.5" stroke="#7a5720" strokeWidth="0.5" opacity="0.6" />
      <line x1="0.5" y1="11.5" x2="43.5" y2="11.5" stroke="#7a5720" strokeWidth="0.5" opacity="0.6" />
      <line x1="0.5" y1="22.5" x2="43.5" y2="22.5" stroke="#7a5720" strokeWidth="0.5" opacity="0.6" />
      {/* small connector lines suggesting internal circuitry, top-left pad */}
      <path d="M4 11.5 V6 a2 2 0 0 1 2 -2 h5" stroke="#7a5720" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M40 22.5 V28 a2 2 0 0 1 -2 2 h-5" stroke="#7a5720" strokeWidth="0.5" fill="none" opacity="0.5" />
      <rect x="0.5" y="0.5" width="43" height="33" rx="6" fill="url(#chip-sheen)" opacity="0.5" />
    </svg>
  );
}

/** A small original abstract mark — two overlapping rings, not modeled on any real card network. */
function CardMark() {
  return (
    <div className="flex items-center" aria-hidden>
      <div className="h-7 w-7 rounded-full bg-white/75" />
      <div className="-ml-3 h-7 w-7 rounded-full bg-white/45 mix-blend-screen" />
    </div>
  );
}

/**
 * The app's one balance-card design — a single, realistic, premium fintech
 * card. Real proportions, a proper EMV chip, masked card number, cardholder
 * name + expiry, and a generous dedicated signature panel that's the same
 * visual weight a real card gives its signature strip.
 */
export function VirtualCard({ balance, name, currency, cardStyle, signatureUrl, memberSince }: VirtualCardProps) {
  const style = getCardStyle(cardStyle);
  const displayName = (name || "Your account").toUpperCase();

  // Subtle desktop-only pointer tilt + glow for a bit of material presence.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 220, damping: 24, mass: 0.4 });
  const tiltY = useSpring(rawTiltY, { stiffness: 220, damping: 24, mass: 0.4 });
  const glowX = useTransform(tiltY, [-6, 6], [15, 85]);
  const glowY = useTransform(tiltX, [6, -6], [15, 85]);
  const glowBackground = useTransform([glowX, glowY], ([gx, gy]: number[]) =>
    `radial-gradient(380px circle at ${gx}% ${gy}%, rgba(255,255,255,0.13), transparent 60%)`,
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawTiltY.set(px * 6);
    rawTiltX.set(py * -5);
  };

  const resetTilt = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  return (
    <div
      ref={wrapperRef}
      className="group relative mx-auto mb-4 w-full sm:mb-5 lg:max-w-[430px]"
      style={{ perspective: 1600 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <motion.div
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
        className="relative aspect-[1.586] w-full min-h-[218px] overflow-hidden rounded-[20px] transition-transform duration-300 group-hover:-translate-y-1"
      >
        <div
          className={`absolute inset-0 flex flex-col bg-gradient-to-br ${style.gradient} text-white shadow-[0_18px_44px_-14px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_26px_58px_-14px_rgba(0,0,0,0.6)]`}
        >
          {/* Fine brushed-metal texture + diagonal sheen for material realism */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{ background: "linear-gradient(120deg, transparent 38%, rgba(255,255,255,0.14) 50%, transparent 64%)" }}
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/[0.07]" aria-hidden />
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glowBackground }}
            aria-hidden
          />

          {/* ---- top: brand + contactless ---- */}
          <div className="relative flex items-center justify-between px-5 pt-4">
            <span className="text-[14px] font-semibold tracking-[0.07em] opacity-95">Clearing</span>
            <Wifi size={19} className="rotate-90 opacity-70" />
          </div>

          {/* ---- chip + balance ---- */}
          <div className="relative mt-3 flex items-center justify-between px-5">
            <Chip />
            <div className="text-right">
              <p className="text-[9.5px] font-medium uppercase tracking-wider opacity-60">Balance</p>
              <p className="num mt-0.5 text-[22px] font-semibold leading-none tracking-tight sm:text-[24px]">
                {formatCurrency(balance, currency)}
              </p>
            </div>
          </div>

          {/* ---- card number ---- */}
          <p className="num relative mt-3 px-5 text-[15.5px] tracking-[0.12em] opacity-90 sm:text-[17px]">
            {maskedNumber(name || "clearing")}
          </p>

          {/* ---- cardholder + expiry ---- */}
          <div className="relative mt-2.5 flex items-end justify-between px-5">
            <div className="min-w-0">
              <p className="text-[8px] font-medium uppercase tracking-[0.16em] opacity-55">Card holder</p>
              <p className="truncate text-[12px] font-medium tracking-wide opacity-90">{displayName}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[8px] font-medium uppercase tracking-[0.16em] opacity-55">Expires</p>
              <p className="num text-[12px] font-medium tracking-wide opacity-90">{expiryFrom(memberSince)}</p>
            </div>
            <CardMark />
          </div>

          {/* ---- signature panel: the dedicated, generously sized signature strip ---- */}
          <div className="relative mt-2.5 flex flex-1 items-center gap-3 border-t border-white/15 bg-white/[0.055] px-5">
            <div className="flex h-full flex-1 items-center">
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt=""
                  className="h-[70%] max-h-16 max-w-[85%] object-contain object-left opacity-95 [filter:brightness(0)_invert(1)] sm:max-h-20"
                />
              ) : (
                <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] opacity-40">Authorized signature</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
