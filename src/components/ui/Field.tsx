import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

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
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]">
        {currencySymbol}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(baseFieldStyles, "num pl-8", className)}
        {...rest}
      />
    </div>
  );
}
