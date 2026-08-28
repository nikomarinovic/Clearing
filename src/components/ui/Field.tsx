import { useEffect, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import { formatNumber } from "../../lib/format";

const baseFieldStyles =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] text-[var(--text)] placeholder:text-[var(--text-faint)] transition-colors focus:border-[var(--accent-blue)] focus:outline-none";

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-[var(--text-muted)]">
      {children}
    </label>
  );
}

export function Field({ label, htmlFor, children, hint }: { label?: string; htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      {label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
      {children}
      {hint && <p className="mt-1.5 text-xs text-[var(--text-faint)]">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(baseFieldStyles, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(baseFieldStyles, "resize-none", className)} rows={3} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(baseFieldStyles, "appearance-none bg-no-repeat", className)} {...rest}>
      {children}
    </select>
  );
}

export function AmountInput({
  value,
  onChange,
  currencySymbol = "\u20AC",
  className,
  ...rest
}: {
  value: number | string;
  onChange: (v: string) => void;
  currencySymbol?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  // Parses either "10.000,00" (grouped display) or a plain "10000.00" /
  // "10000,00" into a JS-parseable number. Whichever separator appears
  // last is treated as the decimal point; the other is stripped as a
  // thousands separator.
  const parseLocaleNumber = (raw: string): number => {
    let s = raw.trim().replace(/[^0-9.,-]/g, "");
    if (!s) return NaN;
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else if (lastDot > -1) {
      const parts = s.split(".");
      const decimals = parts.pop();
      s = parts.join("") + "." + decimals;
    }
    return Number.parseFloat(s);
  };

  const formatGrouped = (raw: string): string => {
    const n = parseLocaleNumber(String(raw));
    if (Number.isNaN(n)) return "";
    return formatNumber(n);
  };

  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));

  useEffect(() => {
    if (!focused) setDraft(String(value ?? ""));
  }, [value, focused]);

  const displayValue = focused ? draft : formatGrouped(draft) || draft;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">
        {currencySymbol}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onFocus={() => {
          setFocused(true);
          setDraft(String(value ?? ""));
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          const parsed = parseLocaleNumber(raw);
          onChange(Number.isNaN(parsed) ? "" : String(parsed));
        }}
        className={clsx(baseFieldStyles, "num pl-8", className)}
        {...rest}
      />
    </div>
  );
}
