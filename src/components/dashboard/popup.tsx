"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { OrderItem } from "@/app/dashboard/orderActions";
import { Card, cn, formatRs, playBeep } from "./ui";

/** Input style without a width, so callers can size it. */
export const inputBase =
  "rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none";
export const inputClass = cn(inputBase, "w-full");

export const secondaryButtonClass =
  "rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-60";
export const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#00e676] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500";

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Popup shell: dark overlay, centered card, title with close button, Escape to close. */
export function Modal({
  title,
  onClose,
  busy = false,
  wide = false,
  children,
}: {
  title: string;
  onClose: () => void;
  busy?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn("my-auto w-full", wide ? "max-w-lg" : "max-w-md")}
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}

/** Numbered list of items with a total row; optional remove button per item. */
export function ItemsList({
  items,
  onRemove,
  totalLabel,
}: {
  items: OrderItem[];
  onRemove?: (index: number) => void;
  totalLabel: string;
}) {
  const total = items.reduce((a, i) => a + i.price, 0);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted">No items added yet.</p>
      ) : (
        <ul className="max-h-64 divide-y divide-white/5 overflow-y-auto">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/15 text-xs font-bold text-accent">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{item.name}</span>
              <span className="shrink-0 text-sm font-semibold text-white">{formatRs(item.price)}</span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${item.name}`}
                  className="grid size-7 shrink-0 place-items-center rounded-lg text-danger transition hover:bg-danger/15"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="text-sm font-semibold text-muted">{totalLabel}</span>
        <span className="text-lg font-bold text-accent">{formatRs(total)}</span>
      </div>
    </div>
  );
}

/** "Add Item" row: item name + price + add button (Enter also adds). */
export function ItemAdder({ onAdd }: { onAdd: (item: OrderItem) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const canAdd = name.trim() !== "" && price !== "" && Number(price) >= 0;

  const add = () => {
    if (!canAdd) return;
    onAdd({ name: name.trim(), price: Number(price) });
    setName("");
    setPrice("");
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-muted">Add Item</span>
      {/* Phones: name on its own row; from sm up: name | price | + */}
      <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_8rem_auto]">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Item name"
          className={cn(inputBase, "col-span-2 min-w-0 sm:col-span-1")}
        />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Price"
          className={cn(inputBase, "min-w-0")}
        />
        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          aria-label="Add item"
          className="grid h-full min-h-[38px] w-[38px] place-items-center rounded-lg bg-accent text-black transition hover:bg-[#00e676] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** How many of the latest items are listed on a card. */
const CARD_ITEMS = 3;

/** Card preview of the latest 3 items (items are stored oldest first); "+N more" opens the full view. */
export function CardItemsPreview({ items, onMore }: { items: OrderItem[]; onMore: () => void }) {
  if (items.length === 0) return null;
  const extra = items.length - CARD_ITEMS;
  const first = Math.max(0, extra); // index of the first shown item, for numbering
  // Same row design as the popup's ItemsList.
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
      <ul className="divide-y divide-white/5">
        {items.slice(-CARD_ITEMS).map((item, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/15 text-xs font-bold text-accent">
              {first + i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{item.name}</span>
            <span className="shrink-0 text-sm font-semibold text-white">{formatRs(item.price)}</span>
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          onClick={onMore}
          className="w-full border-t border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-xs font-medium text-accent hover:underline"
        >
          +{extra} more {extra === 1 ? "item" : "items"}
        </button>
      )}
    </div>
  );
}

/** Delete confirmation popup; beeps on Delete and shows any error. */
export function ConfirmDeleteModal({
  title,
  children,
  onConfirm,
  onClose,
  onDeleted,
}: {
  title: string;
  /** The confirmation message. */
  children: ReactNode;
  onConfirm: () => Promise<{ error?: string }>;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    playBeep();
    setBusy(true);
    setError("");
    const { error } = await onConfirm();
    if (error) {
      setBusy(false);
      setError(error);
      return;
    }
    onDeleted();
  };

  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <p className="text-sm leading-relaxed text-muted">{children}</p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-3 pt-5">
        <button type="button" onClick={onClose} disabled={busy} className={secondaryButtonClass}>
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="size-4" />
          {busy ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
