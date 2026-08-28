import { useState } from "react";
import { Plus, Heart } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { WishCard } from "../components/wishes/WishCard";
import { WishForm, type WishDraft } from "../components/wishes/WishForm";
import { useAppData } from "../hooks/useAppData";
import { useToast } from "../hooks/useToast";
import { formatCurrency } from "../lib/format";
import type { WishItem } from "../types";

export default function WishesPage() {
  const { data, addWish, updateWish, deleteWish, convertWishToExpense } = useAppData();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<WishItem | null>(null);
  const [deletingWishId, setDeletingWishId] = useState<string | null>(null);
  const [convertingWish, setConvertingWish] = useState<WishItem | null>(null);
  const [removeAfterConvert, setRemoveAfterConvert] = useState(true);

  const totalWishlist = data.wishes.reduce((sum, w) => sum + w.price, 0);

  const saveWish = (draft: WishDraft) => {
    const payload = {
      name: draft.name.trim(),
      price: parseFloat(draft.price),
      imageUrl: draft.imageUrl,
      notes: draft.notes.trim() || undefined,
    };
    if (editingWish) {
      updateWish(editingWish.id, payload);
      showToast("Wish updated", "success");
    } else {
      addWish(payload);
      showToast("Added to your wishlist", "success");
    }
    setFormOpen(false);
    setEditingWish(null);
  };

  return (
    <div className="pb-6">
      <PageHeader title="Wishes" subtitle="Things you want, tracked separately from your actual balance." />

      {totalWishlist > 0 && (
        <Card className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">Total wishlist value</p>
          <p className="num mt-1 text-2xl font-semibold text-[var(--text)]">{formatCurrency(totalWishlist, data.profile.currency)}</p>
          <p className="mt-1 text-xs text-[var(--text-faint)]">Just a wishlist \u2014 none of this affects your balance until you actually buy something.</p>
        </Card>
      )}

      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-[var(--text)]">
          <Heart size={16} /> Your wishlist
        </h2>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={14} />}
          onClick={() => {
            setEditingWish(null);
            setFormOpen(true);
          }}
        >
          Add wish
        </Button>
      </div>

      {data.wishes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Heart size={20} />}
            title="Nothing on your wishlist yet"
            description="Add something you're saving up for \u2014 a photo, name, and price. It won't touch your balance until you actually buy it."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                Add your first wish
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.wishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              currency={data.profile.currency}
              onEdit={() => {
                setEditingWish(wish);
                setFormOpen(true);
              }}
              onDelete={() => setDeletingWishId(wish.id)}
              onConvert={() => {
                setRemoveAfterConvert(true);
                setConvertingWish(wish);
              }}
            />
          ))}
        </div>
      )}

      <WishForm
        open={formOpen}
        initial={editingWish}
        onClose={() => {
          setFormOpen(false);
          setEditingWish(null);
        }}
        onSave={saveWish}
      />

      <ConfirmDialog
        open={!!deletingWishId}
        title="Remove this wish?"
        description="This just removes it from your wishlist \u2014 nothing to do with your balance."
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (deletingWishId) {
            deleteWish(deletingWishId);
            showToast("Removed from wishlist", "neutral");
          }
          setDeletingWishId(null);
        }}
        onCancel={() => setDeletingWishId(null)}
      />

      <ConfirmDialog
        open={!!convertingWish}
        title="Turn this into an expense?"
        description={
          convertingWish
            ? `This adds ${formatCurrency(convertingWish.price, data.profile.currency)} as a paid expense and updates your balance.`
            : ""
        }
        confirmLabel="Add as expense"
        onConfirm={() => {
          if (convertingWish) {
            convertWishToExpense(convertingWish.id, { removeFromWishes: removeAfterConvert });
            showToast(
              removeAfterConvert ? "Added as an expense and removed from your wishlist" : "Added as an expense",
              "success",
            );
          }
          setConvertingWish(null);
        }}
        onCancel={() => setConvertingWish(null)}
      >
        <label className="mt-4 flex cursor-pointer items-center gap-2.5 rounded-[12px] bg-[var(--surface-2)]/50 p-3 text-[13.5px] text-[var(--text)]">
          <input
            type="checkbox"
            checked={removeAfterConvert}
            onChange={(e) => setRemoveAfterConvert(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent-green)]"
          />
          Remove it from my wishlist once it's an expense
        </label>
      </ConfirmDialog>
    </div>
  );
}
