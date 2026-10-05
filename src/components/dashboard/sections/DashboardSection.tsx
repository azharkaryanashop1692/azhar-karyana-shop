"use client";

import { useState } from "react";
import { CalendarClock, HandCoins, TrendingUp } from "lucide-react";
import type { TabId } from "../navigation";
import type { ShopHistoryRecord } from "@/app/dashboard/actions";
import type { Order } from "@/app/dashboard/orderActions";
import type { Person } from "@/app/dashboard/peopleActions";
import { Badge, Card, CardHeader, EmptyState, KpiCard, formatRs } from "../ui";
import { ViewPersonModal } from "./PeoplesRecordSection";

// shop_history columns that make up Today Cash and Payable (see Add Shop Record).
const CASH_COLUMNS = [
  "cash_10_20",
  "cash_50_100",
  "cash_500_1000",
  "jazzcash",
  "easypaisa",
  "abbas",
  "waqas",
  "azhar",
  "tassawar",
  "mazhar",
  "others",
];
const PAYABLE_COLUMNS = [
  "pay_hafiz",
  "pay_telenor",
  "pay_jazz",
  "pay_zong1",
  "pay_zong2",
  "pay_waqas",
  "pay_abu",
  "pay_azhar",
  "pay_tassawar",
  "pay_mazhar",
  "pay_others",
];

/** Profit isn't stored: Total Cash = (Today Cash total - Payable total) + Profit. */
function profitOf(r: ShopHistoryRecord) {
  const v = r.detail.values;
  const sumOf = (cols: string[]) => cols.reduce((a, c) => a + (v[c] ?? 0), 0);
  return r.totalCash - (sumOf(CASH_COLUMNS) - sumOf(PAYABLE_COLUMNS));
}

/** "YYYY-MM-DD" -> "MM/DD/YYYY". */
function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
}

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

/** Signed amount badge: green when 0 or more, red when negative. */
function SignedBadge({ value }: { value: number }) {
  return (
    <Badge tone={value >= 0 ? "green" : "red"}>
      {value >= 0 ? "+" : "-"} {formatRs(Math.abs(value))}
    </Badge>
  );
}

export default function DashboardSection({
  onNavigate,
  history,
  orders,
  people,
  shopNeeds,
}: {
  onNavigate: (id: TabId) => void;
  history: ShopHistoryRecord[] | null;
  orders: Order[] | null;
  people: Person[] | null;
  shopNeeds: string;
}) {
  const [viewing, setViewing] = useState<Person | null>(null);

  const allOrders = orders?.length ?? 0;
  const todayOrders = (orders ?? []).filter((o) => isToday(o.createdAt)).length;
  const pendingAmount = (people ?? [])
    .filter((p) => p.status === "Pending")
    .reduce((a, p) => a + p.totalPrice, 0);
  // Both lists are already sorted newest first.
  const latestHistory = (history ?? []).slice(0, 3);
  const latestPeople = (people ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard icon={TrendingUp} label="All Orders" value={allOrders.toLocaleString("en-US")} />
        <KpiCard icon={HandCoins} label="Total Pending Amount" value={formatRs(pendingAmount)} tone="neutral" />
        <KpiCard icon={CalendarClock} label="Today Orders" value={todayOrders.toLocaleString("en-US")} tone="danger" />
      </div>

      {/* Shop history + Shop needs */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Shop History"
            subtitle="Latest 3 records by publish date"
            onViewAll={() => onNavigate("history")}
          />
          {latestHistory.length === 0 ? (
            <EmptyState>{history === null ? "Could not load shop history." : "No records yet."}</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="pb-3 font-medium">Creator</th>
                    <th className="pb-3 font-medium">Profit (RS)</th>
                    <th className="pb-3 text-right font-medium">Sale (RS)</th>
                  </tr>
                </thead>
                <tbody>
                  {latestHistory.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 last:border-0">
                      <td className="py-3.5 pr-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold uppercase text-white">
                            {r.creator.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[14rem] truncate font-medium text-white">{r.creator}</p>
                            <p className="text-xs text-muted">{formatDate(r.publishDate)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3.5 font-semibold ${profitOf(r) < 0 ? "text-danger" : "text-white"}`}>
                        {formatRs(profitOf(r))}
                      </td>
                      <td className="py-3.5 text-right">
                        <SignedBadge value={r.totalSale} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Shop Needs Overview"
            subtitle="Items running low on stock"
            onViewAll={() => onNavigate("needs")}
          />
          <div className="max-h-64 flex-1 overflow-y-auto whitespace-pre-line break-words rounded-xl border border-white/5 bg-[#1a1a1a] p-4 text-sm leading-relaxed text-zinc-300">
            {shopNeeds.trim() ? shopNeeds : <span className="text-muted">No shop needs saved yet.</span>}
          </div>
        </Card>
      </div>

      {/* People's record */}
      <Card>
        <CardHeader
          title="People's Record"
          subtitle="Latest 5 people"
          onViewAll={() => onNavigate("people")}
        />
        {latestPeople.length === 0 ? (
          <EmptyState>{people === null ? "Could not load people." : "No people yet."}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-3 font-medium">People Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {latestPeople.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0">
                    <td className="max-w-[16rem] truncate py-3.5 pr-3 font-medium text-white">{p.name}</td>
                    <td className="py-3.5">
                      <Badge tone={p.status === "Pending" ? "amber" : "green"}>{p.status}</Badge>
                    </td>
                    <td className="py-3.5 text-white">{formatRs(p.totalPrice)}</td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setViewing(p)}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/10 transition hover:bg-accent hover:text-black"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {viewing && <ViewPersonModal person={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
