const currencyCache = new Map<string, Intl.NumberFormat>();

// "de-DE" gives the "." thousands / "," decimal grouping (e.g. 10.000,00)
// used across Central/Southeastern Europe, instead of the "10,000.00" style.
const NUMBER_LOCALE = "de-DE";

let plainFormatter: Intl.NumberFormat | null = null;

export function formatCurrency(amount: number, currency = "EUR"): string {
  let formatter = currencyCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(NUMBER_LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currencyCache.set(currency, formatter);
  }
  return formatter.format(amount);
}

/** Same grouping/decimal style as formatCurrency, without a currency symbol. */
export function formatNumber(amount: number): string {
  if (!plainFormatter) {
    plainFormatter = new Intl.NumberFormat(NUMBER_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return plainFormatter.format(amount);
}

export function formatSignedCurrency(amount: number, currency = "EUR"): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "\u2212" : "";
  return `${sign}${formatCurrency(Math.abs(amount), currency)}`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...opts,
  });
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}\u2013${formatDate(endIso)}`;
  }
  return `${formatDate(startIso)} \u2013 ${formatDate(endIso)}`;
}

export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const ms = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

export function monthEndIso(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export function isSameMonth(aIso: string, bIso: string): boolean {
  const a = new Date(aIso);
  const b = new Date(bIso);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
