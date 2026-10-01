import { ShoppingBag, TrendingUp, TriangleAlert } from "lucide-react";
import type { TabId } from "../navigation";
import { kpis, latestOrders, peopleSummary, shopNeedsText } from "../mockData";
import { Badge, Card, CardHeader, KpiCard, formatRs } from "../ui";

export default function DashboardSection({
  onNavigate,
}: {
  onNavigate: (id: TabId) => void;
}) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard icon={TrendingUp} label="All Orders" value={kpis.allOrders} />
        <KpiCard icon={ShoppingBag} label="Pending Orders" value={kpis.pendingOrders} tone="neutral" />
        <KpiCard icon={TriangleAlert} label="Today Orders" value={kpis.todayOrders} tone="danger" />
      </div>

      {/* Orders + Shop needs */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Orders"
            subtitle="Latest transactions with staff creator..."
            onViewAll={() => onNavigate("orders")}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-3 font-medium">Creator</th>
                  <th className="pb-3 font-medium">Sale (RS)</th>
                  <th className="pb-3 text-right font-medium">Profit (RS)</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((o) => (
                  <tr key={o.creator} className="border-b border-white/5 last:border-0">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
                          {o.creator.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{o.creator}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-white">{formatRs(o.sale)}</td>
                    <td className="py-3.5 text-right">
                      <Badge tone={o.profit >= 0 ? "green" : "red"}>
                        {o.profit >= 0 ? "+" : "-"} {formatRs(Math.abs(o.profit))}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Shop Needs Overview"
            subtitle="Items running low on stock"
            onViewAll={() => onNavigate("needs")}
          />
          <div className="max-h-64 flex-1 overflow-y-auto whitespace-pre-line rounded-xl border border-white/5 bg-[#1a1a1a] p-4 text-sm leading-relaxed text-zinc-300">
            {shopNeedsText}
          </div>
        </Card>
      </div>

      {/* People's record */}
      <Card>
        <CardHeader title="People's Record" onViewAll={() => onNavigate("people")} />
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
              {peopleSummary.map((p) => (
                <tr key={p.name} className="border-b border-white/5 last:border-0">
                  <td className="py-3.5 font-medium text-white">{p.name}</td>
                  <td className="py-3.5">
                    <Badge tone={p.status === "Receivable" ? "green" : "red"}>{p.status}</Badge>
                  </td>
                  <td className="py-3.5 text-white">{formatRs(p.amount)}</td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigate("people")}
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
      </Card>
    </div>
  );
}
