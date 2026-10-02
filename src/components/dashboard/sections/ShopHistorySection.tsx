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
  StatusSelect,
} from "../ui";

/** "MM/DD/YYYY" -> "YYYY-MM-DD" to compare with the date picker value. */
function toIsoDate(d: string) {
  const [m, day, y] = d.split("/");
  return `${y}-${m}-${day}`;
}

export default function ShopHistorySection() {
  const [records, setRecords] = useState(shopHistory);
  const [creator, setCreator] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD from the date picker

  const creators = [...new Set(records.map((r) => r.user))];
  const visible = records.filter(
    (r) => (!creator || r.user === creator) && (!date || toIsoDate(r.date) === date),
  );

  return (
    <div className="space-y-6">
      <ActionBar>
        <StatusSelect
          value={creator}
          onChange={setCreator}
          options={creators}
          placeholder="Select Creator"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Filter by date"
          className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white [color-scheme:dark] focus:border-accent/60 focus:outline-none sm:w-48"
        />
      </ActionBar>

      {visible.length === 0 ? (
        <EmptyState>No history records match the selected filters.</EmptyState>
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
