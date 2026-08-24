import type { ExpenseCategory } from "../types";

export interface ScannedReceipt {
  amount: number | null;
  merchant: string | null;
  date: string | null; // ISO
  category: ExpenseCategory;
  rawText: string;
  confidence: number;
}

let workerPromise: Promise<import("tesseract.js").Worker> | null = null;

/**
 * Lazily creates (and caches) a Tesseract worker pointed entirely at files
 * shipped inside this app's own /vendor/tesseract folder — never a CDN.
 * The first scan needs those ~11MB fetched once (same-origin, so the
 * service worker's cache-as-you-go strategy picks them up); every scan
 * after that, including offline, reuses the cached files.
 */
async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        workerPath: "/vendor/tesseract/worker.min.js",
        corePath: "/vendor/tesseract/tesseract-core-simd-lstm.wasm.js",
        langPath: "/vendor/tesseract",
        gzip: true,
        cacheMethod: "none",
      });
      return worker;
    })();
  }
  return workerPromise;
}

const CATEGORY_KEYWORDS: [ExpenseCategory, string[]][] = [
  ["Food", ["restaurant", "cafe", "coffee", "pizza", "grocery", "market", "konzum", "lidl", "spar", "bakery", "food", "burger", "sushi", "bar "]],
  ["Transportation", ["uber", "taxi", "bolt", "bus", "train", "metro", "parking", "toll", "transit"]],
  ["Car", ["fuel", "petrol", "gas station", "diesel", "shell", "ina ", "car wash", "tire", "mechanic"]],
  ["Shopping", ["mall", "store", "shop", "boutique", "amazon", "zara", "h&m", "ikea"]],
  ["Technology", ["electronics", "computer", "phone", "apple store", "best buy", "mediamarkt"]],
  ["Entertainment", ["cinema", "movie", "theatre", "concert", "netflix", "spotify", "game"]],
  ["Health", ["pharmacy", "hospital", "clinic", "doctor", "dental", "ljekarna"]],
  ["Travel", ["hotel", "airbnb", "airline", "flight", "hostel"]],
  ["Personal", ["salon", "barber", "spa", "gym", "haircut"]],
];

function guessCategory(text: string): ExpenseCategory {
  const lower = text.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return "Other";
}

/** Finds the most likely "total" amount on a receipt: prefers lines with a total/sum keyword, otherwise the largest currency-looking number. */
function guessAmount(text: string): number | null {
  const lines = text.split("\n");
  const amountPattern = /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/g;
  const totalKeywords = /total|ukupno|sum|amount due|to pay|iznos/i;

  let bestFromTotalLine: number | null = null;
  const allAmounts: number[] = [];

  for (const line of lines) {
    const matches = [...line.matchAll(amountPattern)].map((m) => parseAmount(m[1]));
    allAmounts.push(...matches);
    if (totalKeywords.test(line) && matches.length > 0) {
      bestFromTotalLine = matches[matches.length - 1];
    }
  }

  if (bestFromTotalLine !== null) return bestFromTotalLine;
  if (allAmounts.length > 0) return Math.max(...allAmounts);
  return null;
}

function parseAmount(raw: string): number {
  // Normalize "1.234,56" or "1,234.56" -> 1234.56
  const cleaned = raw.replace(/\s/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : ".";
  const thousandSep = decimalSep === "," ? "." : ",";
  const normalized = cleaned.split(thousandSep).join("").replace(decimalSep, ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function guessDate(text: string): string | null {
  // Matches DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
  const patterns = [
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{1,2})[./](\d{1,2})[./](\d{4})/,
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    if (pattern === patterns[0]) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    const [, d, m, y] = match;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    if (Number(month) > 12) continue; // guard against a misread MM/DD receipt
    return `${y}-${month}-${day}`;
  }
  return null;
}

function guessMerchant(text: string): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && !/^\d+$/.test(l));
  // Heuristic: the merchant name is usually one of the first non-empty lines
  // and rarely contains a currency amount.
  for (const line of lines.slice(0, 5)) {
    if (!/\d{1,3}[.,]\d{2}/.test(line) && line.length < 40) {
      return line;
    }
  }
  return lines[0] ?? null;
}

export async function scanReceipt(image: File | Blob): Promise<ScannedReceipt> {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  const rawText = data.text ?? "";

  return {
    amount: guessAmount(rawText),
    merchant: guessMerchant(rawText),
    date: guessDate(rawText),
    category: guessCategory(rawText),
    rawText,
    confidence: Math.round(data.confidence ?? 0),
  };
}

/** Frees the OCR worker's memory. Safe to call even if scanning was never used. */
export async function terminateReceiptScanner(): Promise<void> {
  if (!workerPromise) return;
  const worker = await workerPromise;
  await worker.terminate();
  workerPromise = null;
}
