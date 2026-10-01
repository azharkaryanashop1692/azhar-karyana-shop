"use client";

import { useState } from "react";
import { Calendar, User } from "lucide-react";
import { shopHistory } from "../mockData";
import {
  ActionBar,
  Badge,
  Card,
  EditDeleteActions,
  EmptyState,
  SearchInput,
  StatusSelect,
  matches,
} from "../ui";

export default function ShopHistorySection() {
  const [records, setRecords] = useState(shopHistory);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const visible = records.filter(
    (r) => (!status || r.status === status) && matches(query, r.user, r.note, r.id, r.date),
  );

  return (
    <div className="space-y-6">
      <ActionBar>
        <SearchInput value={query} onChange={setQuery} />
        <StatusSelect value={status} onChange={setStatus} options={["Open", "Closed"]} />
      </ActionBar>

      {visible.length === 0 ? (
        <EmptyState>No history records match your search.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((r) => (
            <Card key={r.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold text-white">
                    RS {r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{r.status}</p>
                </div>
                <EditDeleteActions
                  onDelete={() => setRecords((rs) => rs.filter((x) => x.id !== r.id))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" /> {r.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-4" /> {r.user}
                </span>
                <Badge tone="green">#{r.id}</Badge>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-3">
                <p className="text-sm font-bold text-white">Note</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{r.note}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
