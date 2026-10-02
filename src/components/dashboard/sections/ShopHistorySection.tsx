"use client";

import { useEffect, useState } from "react";
import { Calendar, User } from "lucide-react";
import { getShopHistory, type ShopHistoryRecord } from "@/app/dashboard/actions";
import { ActionBar, Card, EmptyState, StatusSelect, cn, formatRs } from "../ui";

/** "YYYY-MM-DD" -> "MM/DD/YYYY" for display. */
function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
}

export default function ShopHistorySection() {
  const [records, setRecords] = useState<ShopHistoryRecord[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [creator, setCreator] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD from the date picker

  useEffect(() => {
    let active = true;
    getShopHistory().then(({ records, error }) => {
      if (!active) return;
      setRecords(records);
      setLoadError(error ?? "");
    });
    return () => {
      active = false;
    };
  }, []);

  const creators = [...new Set((records ?? []).map((r) => r.creator))];
  const visible = (records ?? []).filter(
    (r) => (!creator || r.creator === creator) && (!date || r.publishDate === date),
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
          aria-label="Filter by publish date"
          className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white [color-scheme:dark] focus:border-accent/60 focus:outline-none sm:w-48"
        />
      </ActionBar>

      {records === null ? (
        <EmptyState>Loading shop history...</EmptyState>
      ) : loadError ? (
        <EmptyState>{loadError}</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState>No history records match the selected filters.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((r) => (
            <Card key={r.id} className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Total Cash</p>
                <p className="mt-0.5 text-2xl font-bold text-white">{formatRs(r.totalCash)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" /> {formatDate(r.publishDate)}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <User className="size-4 shrink-0" /> <span className="truncate">{r.creator}</span>
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#1a1a1a] px-3 py-2 text-sm">
                <span className="font-semibold text-muted">Sale</span>
                <span className={cn("font-bold", r.totalSale < 0 ? "text-danger" : "text-accent")}>
                  {formatRs(r.totalSale)}
                </span>
              </div>
              {r.note && (
                <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-3">
                  <p className="text-sm font-bold text-white">Note</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">{r.note}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
