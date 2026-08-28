import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  interactive?: boolean;
}

export function Card({ children, className, padded = true, interactive = false, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]",
        padded && "p-5",
        interactive && "transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-[1px] cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
