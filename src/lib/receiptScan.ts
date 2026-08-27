import type { ExpenseCategory } from "../types";

export interface ScannedReceipt {
  amount: number | null;
  merchant: string | null;
  date: string | null; // ISO
  category: ExpenseCategory;
  rawText: string;
  confidence: number;
}

export const OCR_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "hrv", label: "Croatian" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "slv", label: "Slovenian" },
] as const;

export type OcrLanguageCode = (typeof OCR_LANGUAGES)[number]["code"];

const workerPromises = new Map<string, Promise<import("tesseract.js").Worker>>();

/**
 * Lazily creates (and caches, per language combination) a Tesseract worker
 * pointed entirely at files shipped inside this app's own /vendor/tesseract
 * folder — never a CDN. Loading more than one language (e.g. "eng+hrv")
 * lets Tesseract recognize diacritics like č/ć/š/ž/đ correctly instead of
 * mangling them (and the digits around them) under an English-only model,
 * which was the main cause of missed totals on Croatian receipts.
 */
async function getWorker(languages: OcrLanguageCode[]) {
  const langKey = languages.length ? languages.join("+") : "eng";
  let promise = workerPromises.get(langKey);
  if (!promise) {
    promise = (async () => {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(langKey, 1, {
        workerPath: "/vendor/tesseract/worker.min.js",
        corePath: "/vendor/tesseract/tesseract-core-simd-lstm.wasm.js",
        langPath: "/vendor/tesseract",
        gzip: true,
        cacheMethod: "none",
      });
      return worker;
    })();
    workerPromises.set(langKey, promise);
  }
  return promise;
}

const CATEGORY_KEYWORDS: [ExpenseCategory, { keyword: string; label: string }[]][] = [
  [
    "Food",
    [
      { keyword: "grocery", label: "Groceries" },
      { keyword: "groceries", label: "Groceries" },
      { keyword: "market", label: "Groceries" },
      { keyword: "konzum", label: "Groceries" },
      { keyword: "lidl", label: "Groceries" },
      { keyword: "spar", label: "Groceries" },
      { keyword: "plodine", label: "Groceries" },
      { keyword: "kaufland", label: "Groceries" },
      { keyword: "coffee", label: "Coffee" },
      { keyword: "cafe", label: "Coffee" },
      { keyword: "restaurant", label: "Restaurant" },
      { keyword: "restoran", label: "Restaurant" },
      { keyword: "pizza", label: "Pizza" },
      { keyword: "pekara", label: "Bakery" },
      { keyword: "bakery", label: "Bakery" },
      { keyword: "sushi", label: "Sushi" },
      { keyword: "burger", label: "Fast food" },
      { keyword: "food", label: "Food" },
      { keyword: "bar ", label: "Drinks" },
      { keyword: "kavana", label: "Coffee" },
      { keyword: "pivnica", label: "Drinks" },
    ],
  ],
  [
    "Transportation",
    [
      { keyword: "uber", label: "Ride" },
      { keyword: "taxi", label: "Taxi" },
      { keyword: "bolt", label: "Ride" },
      { keyword: "bus", label: "Transit" },
      { keyword: "train", label: "Transit" },
      { keyword: "metro", label: "Transit" },
      { keyword: "parking", label: "Parking" },
      { keyword: "toll", label: "Toll" },
      { keyword: "transit", label: "Transit" },
    ],
  ],
  [
    "Car",
    [
      { keyword: "fuel", label: "Fuel" },
      { keyword: "petrol", label: "Fuel" },
      { keyword: "gas station", label: "Fuel" },
      { keyword: "diesel", label: "Fuel" },
      { keyword: "shell", label: "Fuel" },
      { keyword: "ina ", label: "Fuel" },
      { keyword: "car wash", label: "Car wash" },
      { keyword: "tire", label: "Tires" },
      { keyword: "mechanic", label: "Car service" },
    ],
  ],
  [
    "Shopping",
    [
      { keyword: "mall", label: "Shopping" },
      { keyword: "store", label: "Shopping" },
      { keyword: "shop", label: "Shopping" },
      { keyword: "boutique", label: "Shopping" },
      { keyword: "amazon", label: "Online order" },
      { keyword: "zara", label: "Clothing" },
      { keyword: "h&m", label: "Clothing" },
      { keyword: "ikea", label: "Home goods" },
    ],
  ],
  [
    "Technology",
    [
      { keyword: "electronics", label: "Electronics" },
      { keyword: "computer", label: "Electronics" },
      { keyword: "phone", label: "Electronics" },
      { keyword: "apple store", label: "Electronics" },
      { keyword: "best buy", label: "Electronics" },
      { keyword: "mediamarkt", label: "Electronics" },
    ],
  ],
  [
    "Entertainment",
    [
      { keyword: "cinema", label: "Cinema" },
      { keyword: "movie", label: "Cinema" },
      { keyword: "theatre", label: "Theatre" },
      { keyword: "concert", label: "Concert" },
      { keyword: "netflix", label: "Streaming" },
      { keyword: "spotify", label: "Streaming" },
      { keyword: "game", label: "Entertainment" },
    ],
  ],
  [
    "Health",
    [
      { keyword: "pharmacy", label: "Pharmacy" },
      { keyword: "hospital", label: "Healthcare" },
      { keyword: "clinic", label: "Healthcare" },
      { keyword: "doctor", label: "Healthcare" },
      { keyword: "dental", label: "Dental" },
      { keyword: "ljekarna", label: "Pharmacy" },
    ],
  ],
  [
    "Travel",
    [
      { keyword: "hotel", label: "Hotel" },
      { keyword: "airbnb", label: "Accommodation" },
      { keyword: "airline", label: "Flight" },
      { keyword: "flight", label: "Flight" },
      { keyword: "hostel", label: "Accommodation" },
    ],
  ],
  [
    "Personal",
    [
      { keyword: "salon", label: "Personal care" },
      { keyword: "barber", label: "Personal care" },
      { keyword: "spa", label: "Personal care" },
      { keyword: "gym", label: "Gym" },
      { keyword: "haircut", label: "Personal care" },
    ],
  ],
];

function matchKeyword(lower: string): { category: ExpenseCategory; label: string } | null {
  for (const [category, entries] of CATEGORY_KEYWORDS) {
    for (const { keyword, label } of entries) {
      if (lower.includes(keyword)) return { category, label };
    }
  }
  return null;
}

/** Finds the most likely "total" amount on a receipt: prefers lines with a total/sum keyword, otherwise the largest currency-looking number. */
function guessAmount(text: string): number | null {
  const lines = text.split("\n");
  // Accepts "12,50" / "12.50" / "1.234,56" / "1 234,56" / "1,234.56"
  const amountPattern = /(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})/g;
  const totalKeywords = /total|ukupno|sveukupno|za\s*platiti|za\s*naplatu|sum|amount due|to pay|iznos|gotovina|kartica/i;

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
  // Normalize "1.234,56" / "1 234,56" / "1,234.56" -> 1234.56
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

/** True if a line looks like a real, readable name rather than OCR noise (stray symbols, single-letter fragments, barcode digits). */
function looksReadable(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 40) return false;
  // À-ÿ covers most Latin-1 accents; čćžšđ (and capitals) are Latin Extended-A
  // and fall outside that range, so they're listed explicitly — otherwise
  // Croatian/Slovenian merchant names get misjudged as OCR noise.
  const letters = trimmed.replace(/[^a-zA-ZÀ-ÿčćžšđČĆŽŠĐ]/g, "").length;
  // Needs a decent letter ratio and at least one real word of 3+ letters.
  if (letters / trimmed.length < 0.55) return false;
  if (!/[a-zA-ZÀ-ÿčćžšđČĆŽŠĐ]{3,}/.test(trimmed)) return false;
  return true;
}

function titleCase(line: string): string {
  return line
    .trim()
    .toLowerCase()
    .replace(/(^|\s)([a-zà-ÿčćžšđ])/g, (_, sep, c) => sep + c.toUpperCase());
}

function guessMerchant(text: string): { merchant: string | null; category: ExpenseCategory } {
  const lower = text.toLowerCase();
  const keywordMatch = matchKeyword(lower);

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\d+$/.test(l));

  // Prefer a clean, readable line near the top of the receipt (that's
  // usually the store name/logo text) over whatever OCR noise came through.
  const candidate = lines.slice(0, 6).find((line) => looksReadable(line) && !/\d{1,3}[.,]\d{2}/.test(line));

  if (candidate) {
    return { merchant: titleCase(candidate), category: keywordMatch?.category ?? "Other" };
  }
  // The top of the receipt was unreadable (logo art, faded print, wrong
  // angle) — fall back to a friendly, category-based guess instead of
  // dumping raw OCR garbage into the name field.
  if (keywordMatch) {
    return { merchant: keywordMatch.label, category: keywordMatch.category };
  }
  return { merchant: null, category: "Other" };
}

export async function scanReceipt(
  image: File | Blob,
  languages: OcrLanguageCode[] = ["eng", "hrv"],
): Promise<ScannedReceipt> {
  const worker = await getWorker(languages);
  const { data } = await worker.recognize(image);
  const rawText = data.text ?? "";
  const { merchant, category } = guessMerchant(rawText);

  return {
    amount: guessAmount(rawText),
    merchant,
    date: guessDate(rawText),
    category,
    rawText,
    confidence: Math.round(data.confidence ?? 0),
  };
}

/** Frees every cached OCR worker's memory. Safe to call even if scanning was never used. */
export async function terminateReceiptScanner(): Promise<void> {
  const promises = [...workerPromises.values()];
  workerPromises.clear();
  await Promise.all(
    promises.map(async (p) => {
      const worker = await p;
      await worker.terminate();
    }),
  );
}
