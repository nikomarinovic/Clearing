import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
        <Compass size={24} />
      </span>
      <h1 className="text-[24px] font-semibold tracking-tight text-[var(--text)]">Page not found</h1>
      <p className="max-w-xs text-[14.5px] text-[var(--text-muted)]">
        The page you're looking for doesn't exist, or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-full bg-[var(--text)] px-5 py-2.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
