"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Eye, Package, Plus, Save, Trash2, X } from "lucide-react";
import { deleteOrder, getOrders, saveOrder, type Order, type OrderItem } from "@/app/dashboard/orderActions";
import {
  ActionBar,
  Card,
  EditDeleteActions,
  EmptyState,
  PrimaryButton,
  SearchInput,
  cn,
  formatRs,
  matches,
} from "../ui";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrdersSection({
  orders,
  setOrders,
}: {
  /** Cached orders (preloaded with the dashboard); null until first loaded. */
  orders: Order[] | null;
  setOrders: (update: (os: Order[] | null) => Order[] | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState("");
  // Popups: "new" = create, an Order = update that order.
  const [editing, setEditing] = useState<Order | "new" | null>(null);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);

  const reload = async () => {
    const { orders, error } = await getOrders();
    if (error) setLoadError(error);
    else setOrders(() => orders);
  };

  // Show the cached orders immediately, then refresh them in the background.
  useEffect(() => {
    let active = true;
    getOrders().then(({ orders, error }) => {
      if (!active) return;
      if (error) setLoadError(error);
      else setOrders(() => orders);
    });
    return () => {
      active = false;
    };
  }, [setOrders]);

  const visible = (orders ?? []).filter((o) =>
    matches(query, o.name, o.creator, ...o.items.map((i) => i.name)),
  );

  return (
    <div className="space-y-6">
      <ActionBar>
        <SearchInput value={query} onChange={setQuery} />
        <PrimaryButton onClick={() => setEditing("new")}>Create New Order</PrimaryButton>
      </ActionBar>

      {orders === null ? (
        <EmptyState>{loadError || "Loading orders..."}</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState>{orders.length ? "No orders match your search." : "No orders yet."}</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {visible.map((o) => (
            <Card key={o.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 break-words text-base font-semibold text-white">{o.name}</h3>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewing(o)}
                    aria-label="View"
                    className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="size-4" />
                  </button>
                  <EditDeleteActions onEdit={() => setEditing(o)} onDelete={() => setDeleting(o)} />
                </div>
              </div>
              <p className="text-sm text-muted">
                {o.items.length} {o.items.length === 1 ? "item" : "items"}
              </p>
              <p className="text-3xl font-bold text-white">{formatRs(o.price)}</p>
              <p className="mt-auto truncate border-t border-white/5 pt-3 text-sm text-muted">
                Created by: <span className="font-medium text-white">{o.creator}</span>
              </p>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <OrderFormModal
          order={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      {viewing && <ViewOrderModal order={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <DeleteOrderModal
          order={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => {
            setOrders((os) => (os ?? []).filter((x) => x.id !== id));
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

/** Popup shell: dark overlay, centered card, title with close button, Escape to close. */
function Modal({
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
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn("w-full", wide ? "max-w-lg" : "max-w-md")}
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

/** List of order items with a total row; optional remove button per item. */
function ItemsList({ items, onRemove }: { items: OrderItem[]; onRemove?: (index: number) => void }) {
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
        <span className="text-sm font-semibold text-muted">Order Price</span>
        <span className="text-lg font-bold text-accent">{formatRs(total)}</span>
      </div>
    </div>
  );
}

function OrderFormModal({
  order,
  onClose,
  onSaved,
}: {
  /** null = create a new order. */
  order: Order | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = order !== null;
  const [name, setName] = useState(order?.name ?? "");
  const [items, setItems] = useState<OrderItem[]>(order?.items ?? []);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canAddItem = itemName.trim() !== "" && itemPrice !== "" && Number(itemPrice) >= 0;
  const canSubmit = name.trim() !== "" && items.length > 0 && !busy;

  const addItem = () => {
    if (!canAddItem) return;
    setItems((list) => [...list, { name: itemName.trim(), price: Number(itemPrice) }]);
    setItemName("");
    setItemPrice("");
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    const { error } = await saveOrder(name, items, order?.id);
    setBusy(false);
    if (error) setError(error);
    else onSaved();
  };

  return (
    <Modal title={isEdit ? "Update Order" : "Create Order"} onClose={onClose} busy={busy} wide>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted">Order Name</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Weekly grocery restock"
            className={inputClass}
          />
        </label>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-muted">Add Item</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              placeholder="Item name"
              className={cn(inputClass, "min-w-0 flex-1")}
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              placeholder="Price"
              className={cn(inputClass, "w-28 shrink-0")}
            />
            <button
              type="button"
              onClick={addItem}
              disabled={!canAddItem}
              aria-label="Add item"
              className="grid size-[38px] shrink-0 place-items-center rounded-lg bg-accent text-black transition hover:bg-[#00e676] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <ItemsList items={items} onRemove={(i) => setItems((list) => list.filter((_, j) => j !== i))} />

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#00e676] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
          >
            {isEdit ? <Save className="size-4" /> : <Plus className="size-4" />}
            {busy ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Order" : "Create Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <Modal title="Order Details" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <Package className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="break-words text-base font-semibold text-white">{order.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">
              {order.creator} · {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        <ItemsList items={order.items} />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteOrderModal({
  order,
  onClose,
  onDeleted,
}: {
  order: Order;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirmDelete = async () => {
    setBusy(true);
    setError("");
    const { error } = await deleteOrder(order.id);
    if (error) {
      setBusy(false);
      setError(error);
      return;
    }
    onDeleted(order.id);
  };

  return (
    <Modal title="Delete Order" onClose={onClose} busy={busy}>
      <p className="text-sm leading-relaxed text-muted">
        Are you sure you want to delete the order{" "}
        <span className="font-semibold text-white">{order.name}</span> with price{" "}
        <span className="font-semibold text-white">{formatRs(order.price)}</span>? Its items will be
        deleted too. This cannot be undone.
      </p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-3 pt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmDelete}
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
