export function LoadingScreen() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-[var(--bg)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--accent-green)] text-white shadow-lg">
        <span className="text-2xl font-bold">C</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-faint)] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-faint)] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-faint)]" />
      </div>
    </div>
  );
}
