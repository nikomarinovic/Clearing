export interface LegalDoc {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}

const EFFECTIVE_DATE = "24 August 2026";

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    intro:
      `Effective ${EFFECTIVE_DATE}. Clearing is a local-first app: your financial data lives only in this browser's storage, on this device. There is no account, no backend server, and nothing you enter is transmitted to us or to any third party. This policy explains exactly what the app stores, what a couple of optional on-device features touch, and what stays entirely under your control.`,
    sections: [
      {
        heading: "What's stored, and where",
        body: "Your profile (name, currency, account type), current balance, income entries, expenses, trips, savings goals, category budgets, reminder settings, and appearance preferences are saved to this browser's localStorage under a single key. This data never leaves the device unless you export it yourself. Clearing your browser data, uninstalling the app, or switching to a different browser or device will not carry it with you \u2014 use Export in Settings to back it up first.",
      },
      {
        heading: "Receipt scanning (optional)",
        body: "If you use \u2018Scan a receipt\u2019, the photo you take or choose is processed entirely on your device using a local OCR engine bundled with the app \u2014 the image is never uploaded, and no photo or receipt text is retained after the scan completes. The very first scan needs a working connection once, to fetch the OCR engine files from this app's own server (not a third party); every scan after that runs fully offline. You can decline to use this feature entirely and enter transactions manually instead.",
      },
      {
        heading: "Notifications (optional)",
        body: "If you enable push notifications, your browser asks you directly for permission; we never see or store that permission, and no reminder content is sent through any external push service \u2014 the reminders themselves are computed on-device from your own data and shown either as an in-app banner or as a native browser notification. You can revoke notification permission at any time from your browser or OS settings, or turn reminders off entirely in Settings.",
      },
      {
        heading: "What we don't do",
        body: "We don't run analytics or tracking scripts on your financial data, don't require sign-up, don't use cookies for advertising or profiling, and don't share information with third parties \u2014 there is nothing to share, since there is no server receiving your entries in this version of the app.",
      },
      {
        heading: "Your choices",
        body: "You can export your data as a JSON file at any time, import it back in (including on a different device, to move your data yourself), or permanently erase everything stored by the app from Settings \u2192 Reset everything. Because there's no account or server copy, a reset is immediate and irreversible unless you exported first.",
      },
      {
        heading: "Children's privacy",
        body: "Clearing is a general-purpose budgeting tool not directed at children, and we don't knowingly collect data from children because we don't collect data from anyone \u2014 everything stays on the device being used.",
      },
      {
        heading: "Changes to this policy",
        body: "If this policy changes in a way that affects what the app stores or how the optional features above work, the \u2018Effective\u2019 date at the top of this page will be updated accordingly.",
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    intro:
      `Effective ${EFFECTIVE_DATE}. By using Clearing, you agree to the following terms. This is a small, local-first personal tool, and these terms are written to match that \u2014 not a substitute for legal advice if you plan to redistribute or commercialize the app.`,
    sections: [
      {
        heading: "No financial advice",
        body: "Clearing performs calculations based entirely on the information you enter \u2014 projections, safe-to-spend figures, purchase-impact estimates, and receipt-scan readings are all derived from that data. None of it is financial, investment, tax, or legal advice, and nothing in the app should be treated as a recommendation to buy, sell, save, or spend. Projections are only as accurate as the entries and assumptions (like recurrence) behind them.",
      },
      {
        heading: "Receipt scanning accuracy",
        body: "The receipt scanner uses on-device text recognition to guess an amount, date, merchant, and category from a photo. It is a convenience for prefilling a form, not a guarantee of accuracy \u2014 always check the scanned values before saving a transaction, especially on faded, handwritten, or non-English receipts.",
      },
      {
        heading: "As-is basis",
        body: "The app is provided as-is and as-available, without warranties of any kind, express or implied, including as to the accuracy of projections, the reliability of OCR results, or uninterrupted availability of any feature that depends on your browser or device (e.g. push notifications, camera access).",
      },
      {
        heading: "Your data, your responsibility",
        body: "Because all data is stored locally on your device and nowhere else, you are solely responsible for backing it up (via Export in Settings) if you want to keep it. We cannot recover data that is lost when local storage is cleared, the app is uninstalled, or the device is lost, damaged, or reset.",
      },
      {
        heading: "Acceptable use",
        body: "Don't use Clearing to store or process data belonging to someone else without their knowledge, or in a way that violates applicable law. The app has no server-side enforcement of this \u2014 it's a statement of expected use, not a technical restriction.",
      },
      {
        heading: "Limitation of liability",
        body: "To the fullest extent permitted by law, we are not liable for any financial decisions made using figures produced by this app, or for data loss arising from normal browser or device behavior (cache clearing, storage limits, OS-level app removal, and similar).",
      },
    ],
  },
  cookies: {
    slug: "cookies",
    title: "Cookie Policy",
    intro:
      "Clearing does not use cookies, and does not use tracking, analytics, or advertising scripts of any kind. This page exists mainly to explain the browser storage the app does use, since it's easy to confuse with cookies.",
    sections: [
      {
        heading: "Storage used, and why",
        body: "The app uses your browser's localStorage (not a cookie) to remember your financial data and preferences between visits, and, if the app is installed as a PWA, a Service Worker cache to let pages, styles, and the receipt-scanner's offline files load without a network connection. Neither mechanism sends data anywhere \u2014 both operate purely within your browser, on your device.",
      },
      {
        heading: "Third-party requests",
        body: "The app loads its typeface from Google Fonts on first load in a browser that hasn't cached it yet (a standard third-party font request, governed by Google's own privacy policy, not ours); after that first load the Service Worker serves it from cache. No other third-party requests are made during normal use \u2014 including receipt scanning, which runs entirely on-device after its one-time initial download.",
      },
      {
        heading: "Your choice",
        body: "The consent banner shown on first visit lets you accept or reject non-essential storage. Since the app doesn't use any non-essential cookies or trackers, rejecting changes nothing about how the app behaves \u2014 your financial data still saves locally either way, because that storage is what makes the app function at all.",
      },
    ],
  },
  notice: {
    slug: "notice",
    title: "Legal Notice",
    intro: "General information about this application.",
    sections: [
      {
        heading: "Nature of the service",
        body: "Clearing is a personal finance planning tool intended to help you understand and project your own finances \u2014 balances, upcoming income and expenses, savings goals, trip budgets, and category spending. It is not a bank, payment processor, lender, or regulated financial institution, and it does not move, hold, or have access to real money in any account.",
      },
      {
        heading: "On-device processing",
        body: "Features like receipt scanning and reminders run entirely on-device: no server performs calculations on your behalf, and no third party is involved in producing the numbers you see in the app.",
      },
      {
        heading: "Review status",
        body: `This text was drafted for the app's own current feature set as of ${EFFECTIVE_DATE} and is intended to be accurate about what the app does and doesn't do. It has not been reviewed by a lawyer and should not be relied on as legal advice \u2014 have these pages reviewed by a qualified professional before any commercial or public launch.`,
      },
    ],
  },
};
