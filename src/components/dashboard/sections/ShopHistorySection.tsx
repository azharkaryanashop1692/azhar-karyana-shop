"use client";

import { useEffect, useState } from "react";
import { Calendar, Trash2, User, X } from "lucide-react";
import { deleteShopRecord, getShopHistory, type ShopHistoryRecord } from "@/app/dashboard/actions";
import { ActionBar, Card, EditDeleteActions, EmptyState, cn, formatRs, playBeep } from "../ui";

/** "YYYY-MM-DD" -> "MM/DD/YYYY" for display. */
function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
}

export default function ShopHistorySection({
  onEdit,
  records,
  setRecords,
}: {
  onEdit: (id: number) => void;
  /** Cached records (preloaded with the dashboard); null until first loaded. */
  records: ShopHistoryRecord[] | null;
  setRecords: (update: (rs: ShopHistoryRecord[] | null) => ShopHistoryRecord[] | null) => void;
}) {
  const [deleting, setDeleting] = useState<ShopHistoryRecord | null>(null);
  const [loadError, setLoadError] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD from the date picker

  // Show the cached records immediately, then refresh them in the background.
  useEffect(() => {
    let active = true;
    getShopHistory().then(({ records, error }) => {
      if (!active) return;
      if (error) setLoadError(error);
      else setRecords(() => records);
    });
    return () => {
      active = false;
    };
  }, [setRecords]);

  const visible = (records ?? []).filter((r) => !date || r.publishDate === date);

  return (
    <div className="space-y-6">
      <ActionBar>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Filter by publish date"
          className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white [color-scheme:dark] focus:border-accent/60 focus:outline-none sm:w-48"
        />
      </ActionBar>

      {records === null ? (
        <EmptyState>{loadError || "Loading shop history..."}</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState>No history records match the selected filters.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((r) => (
            <Card key={r.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Total Cash</p>
                  <p className="mt-0.5 text-2xl font-bold text-white">{formatRs(r.totalCash)}</p>
                </div>
                <EditDeleteActions onEdit={() => onEdit(r.id)} onDelete={() => setDeleting(r)} />
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
              <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-3">
                <p className="text-sm font-bold text-white">Note</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {r.note || "Empty"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {deleting && (
        <DeleteRecordModal
          record={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => {
            setRecords((rs) => (rs ?? []).filter((x) => x.id !== id));
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

function DeleteRecordModal({
  record,
  onClose,
  onDeleted,
}: {
  record: ShopHistoryRecord;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const confirmDelete = async () => {
    playBeep();
    setBusy(true);
    setError("");
    const { error } = await deleteShopRecord(record.id);
    if (error) {
      setBusy(false);
      setError(error);
      return;
    }
    onDeleted(record.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-record-title"
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 id="delete-record-title" className="text-lg font-semibold text-white">
              Delete Record
            </h3>
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
          <p className="text-sm leading-relaxed text-muted">
            Are you sure you want to delete the record of{" "}
            <span className="font-semibold text-white">{formatDate(record.publishDate)}</span> with Total
            Cash <span className="font-semibold text-white">{formatRs(record.totalCash)}</span>? Its
            expenses will be deleted too. This cannot be undone.
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
        </Card>
      </div>
    </div>
  );
}
