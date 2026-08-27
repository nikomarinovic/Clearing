import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Wifi } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import { getCardStyle } from "../../lib/cardStyles";
import { getCardDesign } from "../../lib/cardDesigns";
import type { CardDesign, CardStyle } from "../../types";

interface VirtualCardProps {
  balance: number;
  name: string;
  currency: string;
  cardStyle?: CardStyle;
  cardDesign?: CardDesign;
  signatureUrl?: string;
}

/** Decorative only — never a real card/account number, just a card-shaped visual for the balance. */
function maskedDigits(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const last4 = String(hash % 10000).padStart(4, "0");
  return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${last4}`;
}

function Chip({ tint, outline = false }: { tint: string; outline?: boolean }) {
  if (outline) {
    return (
      <svg width="34" height="26" viewBox="0 0 34 26" fill="none" aria-hidden>
        <rect x="0.5" y="0.5" width="33" height="25" rx="5" stroke="rgba(255,255,255,0.35)" />
        <rect x="11" y="0.5" width="1" height="25" fill="rgba(255,255,255,0.2)" />
        <rect x="22" y="0.5" width="1" height="25" fill="rgba(255,255,255,0.2)" />
      </svg>
    );
  }
  return (
    <svg width="36" height="27" viewBox="0 0 34 26" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="33" height="25" rx="5" fill={tint} stroke="rgba(0,0,0,0.25)" />
      <rect x="0.5" y="9" width="33" height="8" fill="rgba(0,0,0,0.12)" />
      <rect x="11" y="0.5" width="1" height="25" fill="rgba(0,0,0,0.15)" />
      <rect x="22" y="0.5" width="1" height="25" fill="rgba(0,0,0,0.15)" />
      <rect x="0.5" y="9" width="10.5" height="1" fill="rgba(0,0,0,0.15)" />
      <rect x="0.5" y="16" width="10.5" height="1" fill="rgba(0,0,0,0.15)" />
      <rect x="23" y="9" width="10.5" height="1" fill="rgba(0,0,0,0.15)" />
      <rect x="23" y="16" width="10.5" height="1" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

/** A small original abstract mark, not modeled on any real card network. */
function CardMark({ dim = false }: { dim?: boolean }) {
  return (
    <div className="flex items-center" aria-hidden>
      <div className={`h-6 w-6 rounded-full ${dim ? "bg-white/25" : "bg-white/70"}`} />
      <div className={`-ml-2.5 h-6 w-6 rounded-full mix-blend-screen ${dim ? "bg-white/15" : "bg-white/40"}`} />
    </div>
  );
}

/** Renders the user's signature image, or a text fallback, sized per design. */
function Signature({
  signatureUrl,
  name,
  imgClass,
  fallbackClass,
}: {
  signatureUrl?: string;
  name: string;
  imgClass: string;
  fallbackClass: string;
}) {
  if (signatureUrl) {
    return (
      <img
        src={signatureUrl}
        alt=""
        className={`${imgClass} object-contain object-left opacity-95 [filter:brightness(0)_invert(1)]`}
      />
    );
  }
  return <span className={fallbackClass}>{name || "Your account"}</span>;
}

/**
 * A static, premium-styled balance card. No flip gimmick — the "safe to
 * spend" figure already has its own dedicated place further down the
 * dashboard, so the card's whole job is to look and feel like a real card.
 *
 * `cardStyle` picks the color palette; `cardDesign` picks the actual layout,
 * texture, and typography — five distinct looks, each tuned to give the
 * signature real presence rather than treating it as an afterthought.
 */
export function VirtualCard({ balance, name, currency, cardStyle, cardDesign, signatureUrl }: VirtualCardProps) {
  const style = getCardStyle(cardStyle);
  const design = getCardDesign(cardDesign);

  // Subtle desktop-only pointer tilt + glow — the one bit of motion this
  // card keeps, since it reads as premium rather than gimmicky.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 200, damping: 22, mass: 0.4 });
  const tiltY = useSpring(rawTiltY, { stiffness: 200, damping: 22, mass: 0.4 });
  const glowX = useTransform(tiltY, [-6, 6], [15, 85]);
  const glowY = useTransform(tiltX, [6, -6], [15, 85]);
  const glowBackground = useTransform([glowX, glowY], ([gx, gy]: number[]) =>
    `radial-gradient(320px circle at ${gx}% ${gy}%, rgba(255,255,255,0.14), transparent 60%)`,
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawTiltY.set(px * 8);
    rawTiltX.set(py * -7);
  };

  const resetTilt = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  const displayName = name || "";
  const digits = maskedDigits(name || "clearing");
  const glow = (
    <motion.div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: glowBackground }}
      aria-hidden
    />
  );

  return (
    <div
      ref={wrapperRef}
      className="group relative mb-4 w-full sm:mb-5 lg:max-w-md"
      style={{ perspective: 1600 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <motion.div
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
        className={`relative w-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 ${
          design.id === "minimal" ? "h-[216px]" : "h-[206px]"
        } ${
          design.id === "carbon" ? "rounded-[18px]" : design.id === "aurora" ? "rounded-[28px]" : "rounded-[24px]"
        }`}
      >
        {design.id === "premium" && (
          <div
            className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-br ${style.gradient} p-5 text-white shadow-[0_14px_36px_-10px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_22px_50px_-10px_rgba(0,0,0,0.5)]`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
              style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }}
              aria-hidden
            />
            <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/8" aria-hidden />
            <div className="pointer-events-none absolute -bottom-20 -left-14 h-48 w-48 rounded-full bg-white/[0.04]" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 62%)" }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] opacity-70"
              style={{ background: `linear-gradient(90deg, transparent, ${style.chipTint}, transparent)` }}
              aria-hidden
            />
            {glow}

            <div className="relative flex items-start justify-between">
              <span className="text-[13px] font-semibold tracking-[0.14em] opacity-90">CLEARING</span>
              <Wifi size={18} className="rotate-90 opacity-75" />
            </div>

            <Chip tint={style.chipTint} />

            <div className="relative">
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-70">Current balance</p>
              <p className="num mt-0.5 text-[30px] font-semibold tracking-tight">{formatCurrency(balance, currency)}</p>
            </div>

            <div className="relative flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-2">
                <span className="num text-[13px] tracking-[0.15em] opacity-75">{digits}</span>
                <Signature
                  signatureUrl={signatureUrl}
                  name={displayName}
                  imgClass="h-9 max-w-[170px] sm:h-10"
                  fallbackClass="max-w-[170px] truncate text-[13px] font-medium uppercase tracking-wide opacity-85"
                />
              </div>
              <CardMark />
            </div>
          </div>
        )}

        {design.id === "aurora" && (
          <div
            className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-br ${style.gradient} p-5 text-white shadow-[0_14px_36px_-10px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/15 transition-shadow duration-300 group-hover:shadow-[0_22px_50px_-10px_rgba(0,0,0,0.5)]`}
          >
            <div
              className="card-aurora-shimmer pointer-events-none absolute inset-0 opacity-60 mix-blend-color-dodge"
              style={{
                backgroundImage:
                  "linear-gradient(115deg, #ff9ad5 0%, #9ad5ff 22%, #c8ffb0 40%, #ffe29a 58%, #c9a8ff 76%, #ff9ad5 100%)",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{ background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)" }}
              aria-hidden
            />
            {glow}

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rotate-45 bg-white/80" aria-hidden />
                <span className="text-[11px] font-semibold tracking-[0.2em] opacity-90">CLEARING</span>
              </div>
              <Wifi size={17} className="rotate-90 opacity-60" />
            </div>

            <div className="relative flex h-9 w-11 items-center justify-center rounded-[9px] border border-white/25 bg-white/10 backdrop-blur-md" aria-hidden>
              <div className="h-4 w-6 rounded-[3px] border border-white/40" />
            </div>

            <div className="relative w-fit rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-md">
              <p className="text-[10.5px] font-medium uppercase tracking-wider opacity-75">Current balance</p>
              <p className="num mt-0.5 text-[27px] font-semibold tracking-tight">{formatCurrency(balance, currency)}</p>
            </div>

            <div className="relative flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-2">
                <span className="num text-[12.5px] tracking-[0.15em] opacity-70">{digits}</span>
                <Signature
                  signatureUrl={signatureUrl}
                  name={displayName}
                  imgClass="h-9 max-w-[170px] sm:h-10"
                  fallbackClass="max-w-[170px] truncate text-[13px] font-medium uppercase tracking-wide opacity-90"
                />
              </div>
              <CardMark dim />
            </div>
          </div>
        )}

        {design.id === "carbon" && (
          <div className="absolute inset-0 flex flex-col justify-between bg-[linear-gradient(160deg,#232326_0%,#141416_55%,#08080a_100%)] p-5 text-white shadow-[0_14px_36px_-10px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_22px_50px_-10px_rgba(0,0,0,0.65)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 5px), repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 5px)",
              }}
              aria-hidden
            />
            <div
              className={`pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-gradient-to-br ${style.gradient} opacity-30 blur-2xl`}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, transparent, ${style.chipTint}, transparent)` }}
              aria-hidden
            />
            {glow}

            <div className="relative flex items-start justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.24em] opacity-80">CLEARING</span>
              <Wifi size={16} className="rotate-90 opacity-40" />
            </div>

            <Chip tint={style.chipTint} outline />

            <div className="relative">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-55">Current balance</p>
              <p className="num mt-0.5 text-[29px] font-bold tracking-tight">{formatCurrency(balance, currency)}</p>
            </div>

            <div className="relative flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-2">
                <span className="num font-mono text-[12.5px] tracking-[0.14em] opacity-60">{digits}</span>
                <Signature
                  signatureUrl={signatureUrl}
                  name={displayName}
                  imgClass="h-8 max-w-[150px] sm:h-9"
                  fallbackClass="max-w-[150px] truncate font-mono text-[12px] font-medium uppercase tracking-wide opacity-80"
                />
              </div>
              <div
                className="relative rounded-full p-[1px]"
                style={{ background: `linear-gradient(135deg, ${style.swatch[0]}, ${style.swatch[1]})` }}
              >
                <div className="rounded-full bg-[#0a0a0b] p-1">
                  <CardMark dim />
                </div>
              </div>
            </div>
          </div>
        )}

        {design.id === "classic" && (
          <div
            className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-br ${style.gradient} p-5 text-white shadow-[0_14px_36px_-10px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_22px_50px_-10px_rgba(0,0,0,0.5)]`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
              style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)", backgroundSize: "5px 5px" }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-5 top-[38px] h-px opacity-40"
              style={{ background: style.chipTint }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] opacity-80"
              style={{ background: `linear-gradient(90deg, transparent, ${style.chipTint}, transparent)` }}
              aria-hidden
            />
            {glow}

            <div className="relative flex items-start justify-between">
              <span className="font-display text-[16px] italic font-semibold tracking-wide opacity-95">Clearing</span>
              <Wifi size={17} className="rotate-90 opacity-70" />
            </div>

            <div className="relative flex items-center justify-between">
              <Chip tint={style.chipTint} />
              <p className="num text-[13px] tracking-[0.22em] opacity-85">{digits}</p>
            </div>

            <div className="relative">
              <p className="text-[10.5px] font-medium uppercase tracking-wider opacity-70">Current balance</p>
              <p className="num mt-0.5 text-[27px] font-semibold tracking-tight">{formatCurrency(balance, currency)}</p>
            </div>

            <div className="relative flex items-end justify-between gap-3 border-t border-white/15 pt-2">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[8.5px] font-medium uppercase tracking-[0.18em] opacity-55">Authorized signature</span>
                <Signature
                  signatureUrl={signatureUrl}
                  name={displayName}
                  imgClass="h-10 max-w-[190px] sm:h-11"
                  fallbackClass="font-display max-w-[190px] truncate text-[19px] italic tracking-wide opacity-90"
                />
              </div>
              <CardMark />
            </div>
          </div>
        )}

        {design.id === "minimal" && (
          <div
            className="absolute inset-0 flex flex-col justify-between p-5 text-white shadow-[0_14px_36px_-10px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_20px_44px_-10px_rgba(0,0,0,0.45)]"
            style={{ background: style.swatch[1] }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
              style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)" }}
              aria-hidden
            />
            {glow}

            <div className="relative flex items-start justify-between">
              <span className="text-[11px] font-medium tracking-[0.22em] opacity-75">CLEARING</span>
              <Wifi size={15} className="rotate-90 opacity-40" />
            </div>

            <div className="relative">
              <p className="text-[10px] font-medium uppercase tracking-wider opacity-55">Current balance</p>
              <p className="num mt-0.5 text-[19px] font-medium tracking-tight opacity-90">{formatCurrency(balance, currency)}</p>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center gap-3 py-1">
              <Signature
                signatureUrl={signatureUrl}
                name={displayName}
                imgClass="h-16 max-w-[240px] sm:h-[76px]"
                fallbackClass="max-w-[240px] truncate text-center text-[26px] font-medium tracking-tight opacity-95"
              />
              <span className="num text-[11px] tracking-[0.2em] opacity-45">{digits}</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
