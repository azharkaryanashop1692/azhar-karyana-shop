"use client";

import { useEffect, useState } from "react";
import { Eye, Package, Plus, Save } from "lucide-react";
import { deleteOrder, getOrders, saveOrder, type Order, type OrderItem } from "@/app/dashboard/orderActions";
import {
  ActionBar,
  Card,
  EditDeleteActions,
  EmptyState,
  PrimaryButton,
  SearchInput,
  formatRs,
  matches,
  playBeep,
} from "../ui";
import {
  CardItemsPreview,
  ConfirmDeleteModal,
  ItemAdder,
  ItemsList,
  Modal,
  formatDateTime,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../popup";

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
              <CardItemsPreview items={o.items} onMore={() => setViewing(o)} />
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
          onSaved={(saved) => {
            setEditing(null);
            // Show the saved order right away: replace it if updated, else add it first.
            setOrders((os) => {
              const list = os ?? [];
              return list.some((o) => o.id === saved.id)
                ? list.map((o) => (o.id === saved.id ? saved : o))
                : [saved, ...list];
            });
          }}
        />
      )}
      {viewing && <ViewOrderModal order={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <ConfirmDeleteModal
          title="Delete Order"
          onConfirm={() => deleteOrder(deleting.id)}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setOrders((os) => (os ?? []).filter((x) => x.id !== deleting.id));
            setDeleting(null);
          }}
        >
          Are you sure you want to delete the order{" "}
          <span className="font-semibold text-white">{deleting.name}</span> with price{" "}
          <span className="font-semibold text-white">{formatRs(deleting.price)}</span>? Its items will be
          deleted too. This cannot be undone.
        </ConfirmDeleteModal>
      )}
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
  onSaved: (order: Order) => void;
}) {
  const isEdit = order !== null;
  const [name, setName] = useState(order?.name ?? "");
  const [items, setItems] = useState<OrderItem[]>(order?.items ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim() !== "" && items.length > 0 && !busy;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    playBeep();
    setBusy(true);
    setError("");
    const { order: saved, error } = await saveOrder(name, items, order?.id);
    setBusy(false);
    if (saved) onSaved(saved);
    else setError(error ?? "Could not save the order.");
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

        <ItemAdder onAdd={(item) => setItems((list) => [...list, item])} />

        <ItemsList
          items={items}
          totalLabel="Order Price"
          onRemove={(i) => setItems((list) => list.filter((_, j) => j !== i))}
        />

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={secondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={primaryButtonClass}
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
        <ItemsList items={order.items} totalLabel="Order Price" />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClass}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
