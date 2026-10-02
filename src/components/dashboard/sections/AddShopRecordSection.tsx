"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Save, Wallet, X } from "lucide-react";
import { cashAccounts, loadOperators } from "../mockData";
import { Card, CardHeader, cn, formatRs } from "../ui";
import { getPreviousCash, saveShopRecord } from "@/app/dashboard/actions";

type NumMap = Record<string, string>;
type LoadRow = { current: string; purchased: string; sold: string };

const EXPENSE_STATUSES = ["Load", "Other"] as const;
type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];
type Expense = { name: string; price: number; status: ExpenseStatus };

const CASH_PAYABLE_TITLES = ["Hafiz", "Telenor", "Jazz", "Zong1", "Zong2", "Waqas", "Abu", "Others"];

// shop_history column names for each input.
const CASH_COLUMNS: Record<string, string> = {
  "Cash 10/20": "cash_10_20",
  "Cash 50/100": "cash_50_100",
  "Cash 500/1000/5000": "cash_500_1000",
  Jazzcash: "jazzcash",
  Easypaisa: "easypaisa",
  Abbas: "abbas",
  Waqas: "waqas",
  Azhar: "azhar",
  Tassawar: "tassawar",
};
const PAYABLE_COLUMNS: Record<string, string> = {
  Hafiz: "pay_hafiz",
  Telenor: "pay_telenor",
  Jazz: "pay_jazz",
  Zong1: "pay_zong1",
  Zong2: "pay_zong2",
  Waqas: "pay_waqas",
  Abu: "pay_abu",
  Others: "pay_others",
};
const LOAD_PREFIXES: Record<string, string> = {
  Hafiz: "hafiz",
  Telenor: "telenor",
  Jazz: "jazz",
  Ufone: "ufone",
  "Zong 1": "zong1",
  "Zong 2": "zong2",
  Jazzcash: "jazzcash",
};

// Remaining load (excluding Jazzcash) above this counts as additional load.
const ADDITIONAL_LOAD_THRESHOLD = 40000;

const EMPTY_LOAD_ROW: LoadRow = { current: "", purchased: "", sold: "" };

const num = (v: string | undefined) => Number(v) || 0;

/** Today's local date as "YYYY-MM-DD" (the date input's value format). */
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const sum = (m: NumMap) => Object.values(m).reduce((a, v) => a + num(v), 0);

function NumInput({
  value,
  onChange,
  placeholder = "0",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none",
        className,
      )}
    />
  );
}

export default function AddShopRecordSection() {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [todayCash, setTodayCash] = useState<NumMap>({});
  const [cashPayable, setCashPayable] = useState<NumMap>({});
  const [load, setLoad] = useState<Record<string, LoadRow>>({});

  const [profit, setProfit] = useState("");
  const [publishDate, setPublishDate] = useState(todayIso);
  const [previousCash, setPreviousCash] = useState(0);

  // Previous Cash = Total Cash of the latest record published before the selected date.
  useEffect(() => {
    let active = true;
    getPreviousCash(publishDate).then((v) => {
      if (active) setPreviousCash(v);
    });
    return () => {
      active = false;
    };
  }, [publishDate]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const saveRecord = async () => {
    const row: Record<string, number> = {};
    for (const [acc, col] of Object.entries(CASH_COLUMNS)) row[col] = num(todayCash[acc]);
    for (const [title, col] of Object.entries(PAYABLE_COLUMNS)) row[col] = num(cashPayable[title]);
    for (const [op, prefix] of Object.entries(LOAD_PREFIXES)) {
      const r = load[op];
      row[`${prefix}_current`] = num(r?.current);
      row[`${prefix}_purchased`] = num(r?.purchased);
      row[`${prefix}_sold`] = num(r?.sold);
    }
    // Total Cash = Today Cash (Sale panel, i.e. remaining cash) + Profit
    row.total_cash = sum(todayCash) - sum(cashPayable) + num(profit);
    setSaving(true);
    setSaveMsg(null);
    const { error } = await saveShopRecord(row, expenses, publishDate);
    setSaving(false);
    setSaveMsg(error ? { ok: false, text: error } : { ok: true, text: "Record saved." });
  };

  const updateLoad =(op: string, key: keyof LoadRow, v: string) =>
    setLoad((l) => ({
      ...l,
      [op]: { ...(l[op] ?? EMPTY_LOAD_ROW), [key]: v },
    }));

  const totals = useMemo(() => {
    const todayTotal = sum(todayCash);
    const cashPayableTotal = sum(cashPayable);
    const remainingCash = todayTotal - cashPayableTotal;
    const exp = expenses.reduce((a, e) => a + e.price, 0);
    const loadExp = expenses.filter((e) => e.status === "Load").reduce((a, e) => a + e.price, 0);
    const otherExp = exp - loadExp;
    const remainingPrev = previousCash - otherExp;
    const totalSale = remainingCash + num(profit) - remainingPrev;
    const remainingLoad = Object.entries(load)
      .filter(([op]) => op !== "Jazzcash")
      .reduce((a, [, r]) => a + num(r.current) + num(r.purchased) - num(r.sold), 0);
    const additionalLoad = Math.max(0, remainingLoad - ADDITIONAL_LOAD_THRESHOLD);
    return { exp, loadExp, otherExp, additionalLoad, todayTotal, cashPayableTotal, remainingCash, totalSale, remainingPrev };
  }, [todayCash, cashPayable, load, expenses, profit, previousCash]);

  return (
    <div className="space-y-6">
      {/* Top header row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl bg-accent/15 text-accent">
            <Wallet className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted">Previous Cash</p>
            <p className="text-3xl font-bold text-white">{formatRs(previousCash)}</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-center gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Today Expense</p>
              <p className="text-2xl font-bold text-danger">{formatRs(totals.exp)}</p>
            </div>
            <button
              type="button"
              onClick={() => setExpenseOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold tracking-wide text-black transition hover:bg-[#00e676]"
            >
              <Plus className="size-4" />
              ADD EXPENSE
            </button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Cash denominations */}
        <Card className="xl:col-span-3">
          <CardHeader title="Cash Record" subtitle="Today cash and payable amount across all accounts" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Account</th>
                  <th className="pb-2 pl-2 font-medium">Today Cash</th>
                  <th className="pb-2 pl-2 font-medium">Payable Amount</th>
                </tr>
              </thead>
              <tbody>
                {cashAccounts.map((acc, i) => {
                  const payTitle = CASH_PAYABLE_TITLES[i];
                  return (
                    <tr key={acc}>
                      <td className="py-1.5 pr-2 font-medium text-white">{acc}</td>
                      <td className="py-1.5 pl-2">
                        <NumInput
                          value={todayCash[acc] ?? ""}
                          onChange={(v) => setTodayCash((m) => ({ ...m, [acc]: v }))}
                        />
                      </td>
                      <td className="py-1.5 pl-2">
                        {payTitle && (
                          <label className="flex items-center gap-2">
                            <span className="w-16 shrink-0 text-sm font-medium text-white">{payTitle}</span>
                            <NumInput
                              value={cashPayable[payTitle] ?? ""}
                              onChange={(v) => setCashPayable((m) => ({ ...m, [payTitle]: v }))}
                            />
                          </label>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-white/10">
                  <td className="pt-3 font-semibold text-muted">Total</td>
                  <td className="pl-2 pt-3 font-semibold text-accent">{formatRs(totals.todayTotal)}</td>
                  <td className="pl-2 pt-3 font-semibold text-danger">{formatRs(totals.cashPayableTotal)}</td>
                </tr>
                <tr>
                  <td className="pt-3 font-semibold text-muted">Remaining Cash</td>
                  <td
                    colSpan={2}
                    className={cn(
                      "pl-2 pt-3 font-semibold",
                      totals.remainingCash < 0 ? "text-danger" : "text-accent",
                    )}
                  >
                    {formatRs(totals.remainingCash)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expenses linked to this record */}
        <Card className="xl:col-span-2">
          <CardHeader title="Expenses" subtitle="Expenses linked with this record" />
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No expenses added yet.</p>
            ) : (
              expenses.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-[#1a1a1a] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{e.name}</p>
                    <p className="text-xs text-muted">{e.status}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-danger">{formatRs(e.price)}</span>
                </div>
              ))
            )}
            <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted">Load Expenses</span>
                <span className="font-semibold text-danger">{formatRs(totals.loadExp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted">Other Expenses</span>
                <span className="font-semibold text-danger">{formatRs(totals.otherExp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted">Remaining Previous Cash</span>
                <span className="font-semibold text-accent">{formatRs(totals.remainingPrev)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Load record */}
      <Card>
        <CardHeader title="Load Record" subtitle="Mobile load balance per SIM / operator" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Operator</th>
                <th className="pb-2 font-medium">Number</th>
                <th className="pb-2 pl-2 font-medium">Current</th>
                <th className="pb-2 pl-2 font-medium">Purchased</th>
                <th className="pb-2 pl-2 font-medium">Total</th>
                <th className="pb-2 pl-2 font-medium">Sold</th>
                <th className="pb-2 pl-2 font-medium">Remain</th>
              </tr>
            </thead>
            <tbody>
              {loadOperators.map(({ operator, phone }) => {
                const row = load[operator];
                const total = num(row?.current) + num(row?.purchased);
                const remain = total - num(row?.sold);
                return (
                  <tr key={operator}>
                    <td className="py-1.5 pr-2 font-medium text-white">{operator}</td>
                    <td className="py-1.5 pr-2 font-mono text-xs text-muted">{phone}</td>
                    {(["current", "purchased"] as const).map((k) => (
                      <td key={k} className="py-1.5 pl-2">
                        <NumInput value={row?.[k] ?? ""} onChange={(v) => updateLoad(operator, k, v)} />
                      </td>
                    ))}
                    <td className="py-1.5 pl-2 font-semibold text-white">{total.toLocaleString("en-US")}</td>
                    <td className="py-1.5 pl-2">
                      <NumInput value={row?.sold ?? ""} onChange={(v) => updateLoad(operator, "sold", v)} />
                    </td>
                    <td
                      className={cn(
                        "py-1.5 pl-2 font-semibold",
                        remain < 0 ? "text-danger" : "text-accent",
                      )}
                    >
                      {remain.toLocaleString("en-US")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-start">
          <div className="w-full rounded-xl border border-white/5 bg-[#1a1a1a] p-4 sm:w-72">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Additional Load</p>
            <p className="mt-1 text-2xl font-bold text-accent">{formatRs(totals.additionalLoad)}</p>
            <p className="mt-1 text-xs text-muted">
              Remaining load (excl. Jazzcash) above {ADDITIONAL_LOAD_THRESHOLD.toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </Card>

      {/* Sale panel */}
      <Card className="bg-gradient-to-br from-[#2b2b2b] via-[#1f2a22] to-[#1a1a1a]">
        <CardHeader title="Sale" subtitle="Auto-calculated from the record above" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SaleStat
            label="Today Cash"
            value={formatRs(totals.remainingCash)}
            tone={totals.remainingCash < 0 ? "danger" : undefined}
          />
          <label className="block rounded-xl border border-white/5 bg-[#1a1a1a] p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">Profit</span>
            <NumInput
              value={profit}
              onChange={setProfit}
              className="mt-1 text-xl font-bold text-accent"
            />
          </label>
          <SaleStat
            label="Remaining Previous Cash"
            value={formatRs(totals.remainingPrev)}
            tone={totals.remainingPrev < 0 ? "danger" : undefined}
          />
          <div
            className={cn(
              "rounded-xl p-4",
              totals.totalSale < 0 ? "bg-danger text-white" : "bg-accent text-black",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Total Sale</p>
            <p className="mt-1 text-2xl font-bold">{formatRs(totals.totalSale)}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-4">
          {saveMsg && (
            <p className={cn("text-sm", saveMsg.ok ? "text-accent" : "text-danger")}>{saveMsg.text}</p>
          )}
          <input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            aria-label="Publish date"
            suppressHydrationWarning
            className="rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white [color-scheme:dark] focus:border-accent/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={saveRecord}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Record"}
          </button>
        </div>
      </Card>

      {expenseOpen && (
        <AddExpenseModal
          onClose={() => setExpenseOpen(false)}
          onAdd={(e) => {
            setExpenses((list) => [...list, e]);
            setExpenseOpen(false);
          }}
        />
      )}
    </div>
  );
}

function AddExpenseModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (e: Expense) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ExpenseStatus>(EXPENSE_STATUSES[0]);
  const [error, setError] = useState("");
  const canSubmit = name.trim() !== "" && price !== "";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (num(price) <= 0) return setError("Enter a price greater than 0.");
    onAdd({ name: name.trim(), price: num(price), status });
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-expense-title"
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 id="add-expense-title" className="text-lg font-semibold text-white">
              Add Expense
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-muted">Expense Thing Name</span>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tea, Electricity bill"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-muted">Expense Thing Price</span>
              <NumInput value={price} onChange={setPrice} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-muted">Status</span>
              <span className="relative block">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
                  className={cn(inputClass, "appearance-none pr-9")}
                >
                  {EXPENSE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              </span>
            </label>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#00e676] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
              >
                <Plus className="size-4" />
                Add Expense
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function SaleStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "accent" | "danger";
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#1a1a1a] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold",
          tone === "accent" ? "text-accent" : tone === "danger" ? "text-danger" : "text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}
