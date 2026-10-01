"use client";

import { useState } from "react";
import { orders as initialOrders, type OrderStatus } from "../mockData";
import {
  ActionBar,
  Badge,
  Card,
  EditDeleteActions,
  EmptyState,
  PrimaryButton,
  SearchInput,
  StatusSelect,
  formatRs,
  matches,
} from "../ui";

const statusTone: Record<OrderStatus, "green" | "neutral" | "red"> = {
  Pending: "green",
  Delivered: "neutral",
  Cancelled: "red",
};

export default function OrdersSection() {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const visible = orders.filter(
    (o) => (!status || o.status === status) && matches(query, o.title, o.createdBy),
  );

  return (
    <div className="space-y-6">
      <ActionBar>
        <SearchInput value={query} onChange={setQuery} />
        <StatusSelect value={status} onChange={setStatus} options={["Pending", "Delivered", "Cancelled"]} />
        <PrimaryButton>Create New Order</PrimaryButton>
      </ActionBar>

      {visible.length === 0 ? (
        <EmptyState>No orders found.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {visible.map((o) => (
            <Card key={o.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-white">{o.title}</h3>
                <EditDeleteActions
                  onDelete={() => setOrders((os) => os.filter((x) => x.id !== o.id))}
                />
              </div>
              <div>
                <Badge tone={statusTone[o.status]}>{o.status}</Badge>
              </div>
              <p className="text-3xl font-bold text-white">{formatRs(o.price)}</p>
              <p className="mt-auto border-t border-white/5 pt-3 text-sm text-muted">
                Created by: <span className="font-medium text-white">{o.createdBy}</span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
