"use client";

import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { products as initialProducts, type ProductStatus } from "../mockData";
import { Badge, Card, CardHeader, PrimaryButton, SearchInput, StatusSelect, formatRs, matches } from "../ui";

const statusTone: Record<ProductStatus, "green" | "amber" | "red"> = {
  "In Stock": "green",
  "Low Stock": "amber",
  "Out of Stock": "red",
};

export default function ProductsPriceSection() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const visible = products.filter(
    (p) => (!status || p.status === status) && matches(query, p.name),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PrimaryButton>Add New Product</PrimaryButton>
      </div>

      <Card>
        <CardHeader title="Inventory Pricing List" subtitle={`${visible.length} products`}>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <SearchInput value={query} onChange={setQuery} className="sm:w-64" />
            <StatusSelect value={status} onChange={setStatus} options={Object.keys(statusTone)} />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 font-medium">Product Name</th>
                <th className="pb-3 font-medium">Customer Price</th>
                <th className="pb-3 font-medium">Purchase (Piece)</th>
                <th className="pb-3 font-medium">Purchase (Box)</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="py-3.5 font-medium text-white">{p.name}</td>
                  <td className="py-3.5 font-semibold text-accent">{formatRs(p.customerPrice)}</td>
                  <td className="py-3.5 text-white">{formatRs(p.piece)}</td>
                  <td className="py-3.5 text-white">{formatRs(p.box)}</td>
                  <td className="py-3.5 text-muted">{p.date}</td>
                  <td className="py-3.5">
                    <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  </td>
                  <td className="py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`View ${p.name}`}
                        className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => setProducts((ps) => ps.filter((x) => x.id !== p.id))}
                        className="grid size-8 place-items-center rounded-lg text-danger transition hover:bg-danger/15"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
