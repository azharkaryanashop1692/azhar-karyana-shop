"use client";

import { useEffect, useState } from "react";
import { Eye, Plus, Save, Tag } from "lucide-react";
import {
  deleteProduct,
  getProducts,
  saveProduct,
  type Product,
} from "@/app/dashboard/productActions";
import {
  Card,
  CardHeader,
  EditDeleteActions,
  PrimaryButton,
  SearchInput,
  formatRs,
  matches,
  playBeep,
} from "../ui";
import {
  ConfirmDeleteModal,
  Modal,
  formatDateTime,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../popup";

/** ISO timestamp -> "MM/DD/YYYY". */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

export default function ProductsPriceSection({
  products,
  setProducts,
}: {
  /** Cached products (preloaded with the dashboard); null until first loaded. */
  products: Product[] | null;
  setProducts: (update: (ps: Product[] | null) => Product[] | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState("");
  // Popups: "new" = create, a Product = update that product.
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  // Show the cached products immediately, then refresh them in the background.
  useEffect(() => {
    let active = true;
    getProducts().then(({ products, error }) => {
      if (!active) return;
      if (error) setLoadError(error);
      else setProducts(() => products);
    });
    return () => {
      active = false;
    };
  }, [setProducts]);

  const visible = (products ?? []).filter((p) => matches(query, p.name));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PrimaryButton onClick={() => setEditing("new")}>Add New Product</PrimaryButton>
      </div>

      <Card>
        <CardHeader title="Inventory Pricing List" subtitle={`${visible.length} products`}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by product name..."
            className="w-full sm:w-64"
          />
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 font-medium">Product Name</th>
                <th className="pb-3 font-medium">Customer Price</th>
                <th className="pb-3 font-medium">Purchase (Piece)</th>
                <th className="pb-3 font-medium">Purchase (Box)</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="py-3.5 pr-3 font-medium text-white">{p.name}</td>
                  <td className="py-3.5 font-semibold text-accent">{formatRs(p.customerPrice)}</td>
                  <td className="py-3.5 text-white">{formatRs(p.purchasePiece)}</td>
                  <td className="py-3.5 text-white">{formatRs(p.purchaseBox)}</td>
                  <td className="py-3.5 text-muted">{formatDate(p.createdAt)}</td>
                  <td className="py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`View ${p.name}`}
                        onClick={() => setViewing(p)}
                        className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
                      >
                        <Eye className="size-4" />
                      </button>
                      <EditDeleteActions onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted">
                    {products === null
                      ? loadError || "Loading products..."
                      : products.length
                        ? "No products match your search."
                        : "No products yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <ProductFormModal
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEditing(null);
            // Show the saved product right away: replace if updated, else add first.
            setProducts((ps) => {
              const list = ps ?? [];
              return list.some((p) => p.id === saved.id)
                ? list.map((p) => (p.id === saved.id ? saved : p))
                : [saved, ...list];
            });
          }}
        />
      )}
      {viewing && <ViewProductModal product={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <ConfirmDeleteModal
          title="Delete Product"
          onConfirm={() => deleteProduct(deleting.id)}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setProducts((ps) => (ps ?? []).filter((x) => x.id !== deleting.id));
            setDeleting(null);
          }}
        >
          Are you sure you want to delete the product{" "}
          <span className="font-semibold text-white">{deleting.name}</span>? This cannot be undone.
        </ConfirmDeleteModal>
      )}
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-muted">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={inputClass}
      />
    </label>
  );
}

function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  /** null = create a new product. */
  product: Product | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
}) {
  const isEdit = product !== null;
  const str = (n: number | undefined) => (n === undefined ? "" : String(n));
  const [name, setName] = useState(product?.name ?? "");
  const [purchasePiece, setPurchasePiece] = useState(str(product?.purchasePiece));
  const [purchaseBox, setPurchaseBox] = useState(str(product?.purchaseBox));
  const [customerPrice, setCustomerPrice] = useState(str(product?.customerPrice));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    name.trim() !== "" && purchasePiece !== "" && purchaseBox !== "" && customerPrice !== "" && !busy;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    playBeep();
    setBusy(true);
    setError("");
    const { product: saved, error } = await saveProduct(
      {
        name,
        purchasePiece: Number(purchasePiece),
        purchaseBox: Number(purchaseBox),
        customerPrice: Number(customerPrice),
      },
      product?.id,
    );
    setBusy(false);
    if (saved) onSaved(saved);
    else setError(error ?? "Could not save the product.");
  };

  return (
    <Modal title={isEdit ? "Update Product" : "Create Product"} onClose={onClose} busy={busy}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted">Product Name</span>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dalda Cooking Oil 5L"
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <PriceInput label="Purchased Price (Piece)" value={purchasePiece} onChange={setPurchasePiece} />
          <PriceInput label="Purchased Price (Box)" value={purchaseBox} onChange={setPurchaseBox} />
        </div>
        <PriceInput label="Customer Price" value={customerPrice} onChange={setCustomerPrice} />

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={busy} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
            {isEdit ? <Save className="size-4" /> : <Plus className="size-4" />}
            {busy ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ViewProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const rows: [string, number, boolean?][] = [
    ["Customer Price", product.customerPrice, true],
    ["Purchased Price (Piece)", product.purchasePiece],
    ["Purchased Price (Box)", product.purchaseBox],
  ];
  return (
    <Modal title="Product Details" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <Tag className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="break-words text-base font-semibold text-white">{product.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted">
              {product.creator} · {formatDateTime(product.createdAt)}
            </p>
          </div>
        </div>
        <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
          {rows.map(([label, value, highlight]) => (
            <div key={label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="text-muted">{label}</span>
              <span className={highlight ? "text-lg font-bold text-accent" : "font-semibold text-white"}>
                {formatRs(value)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
