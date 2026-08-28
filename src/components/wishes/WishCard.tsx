import { ShoppingBag, Trash2, ArrowRightLeft, Pencil } from "lucide-react";
import type { WishItem } from "../../types";
import { formatCurrency } from "../../lib/format";

export function WishCard({
  wish,
  currency,
  onEdit,
  onDelete,
  onConvert,
}: {
  wish: WishItem;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[var(--border)]">
      <div className="flex items-center justify-between gap-3 p-4">
        <button onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {wish.imageUrl ? (
            <img src={wish.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-[12px] object-cover" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[var(--accent-blue-bg)] text-[var(--accent-blue)]">
              <ShoppingBag size={18} />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-[var(--text)]">{wish.name}</p>
            <p className="num text-[13px] text-[var(--text-muted)]">{formatCurrency(wish.price, currency)}</p>
          </div>
        </button>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            aria-label={`Edit ${wish.name}`}
            className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onConvert}
            aria-label={`Convert ${wish.name} to an expense`}
            className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-green)]"
          >
            <ArrowRightLeft size={14} />
          </button>
          <button
            onClick={onDelete}
            aria-label={`Delete ${wish.name}`}
            className="rounded-full p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--accent-red)]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
