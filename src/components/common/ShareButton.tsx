import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../hooks/useToast";

interface ShareButtonProps {
  title: string;
  text: string;
  /** Optional icon-only compact style for tight header spaces. */
  compact?: boolean;
}

/**
 * Native share (iOS/Android share sheet via navigator.share where
 * supported — Safari on iPhone in particular does this well). Falls back
 * to copying the text to the clipboard on browsers/desktops without it, so
 * the button always does something useful.
 */
export function ShareButton({ title, text, compact }: ShareButtonProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const supportsNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleShare = async () => {
    if (supportsNativeShare) {
      try {
        await navigator.share({ title, text });
      } catch {
        // User cancelled the share sheet — not an error worth surfacing.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Couldn't copy \u2014 select and copy the text manually.", "warning");
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        {copied ? <Check size={15} /> : <Share2 size={15} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-2 text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
