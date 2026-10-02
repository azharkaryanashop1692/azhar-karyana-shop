"use server";

import { createClient } from "@/lib/supabase/server";

export type ShopHistoryRow = Record<string, number>;
export type ExpenseInput = { name: string; price: number; status: "Load" | "Other" };

export type ShopHistoryRecord = {
  id: number;
  publishDate: string; // YYYY-MM-DD
  creator: string;
  totalCash: number;
  totalSale: number;
  note: string;
};

/** All shop_history records, newest publish date first. */
export async function getShopHistory(): Promise<{ records: ShopHistoryRecord[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { records: [], error: "You must be logged in to view history." };

  const { data, error } = await supabase
    .from("shop_history")
    .select("id, publish_date, creator_email, total_cash, total_sale, note")
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return { records: [], error: error.message };

  return {
    records: data.map((r) => ({
      id: r.id,
      publishDate: r.publish_date,
      creator: r.creator_email ?? "Unknown",
      totalCash: Number(r.total_cash) || 0,
      totalSale: Number(r.total_sale) || 0,
      note: r.note ?? "",
    })),
  };
}

const LOAD_PREFIXES = ["hafiz", "telenor", "jazz", "ufone", "zong1", "zong2", "jazzcash"];

export type PreviousRecord = {
  totalCash: number;
  /** Remaining load per operator prefix, e.g. { hafiz: 1200 }. */
  remaining: Record<string, number>;
};

/** Total Cash and remaining load of the latest shop_history record published before `beforeDate` (YYYY-MM-DD). */
export async function getPreviousRecord(beforeDate: string): Promise<PreviousRecord> {
  const empty: PreviousRecord = { totalCash: 0, remaining: {} };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(beforeDate)) return empty;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data } = await supabase
    .from("shop_history")
    .select(["total_cash", ...LOAD_PREFIXES.map((p) => `${p}_remaining`)].join(", "))
    .lt("publish_date", beforeDate)
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return empty;

  const row = data as unknown as Record<string, unknown>;
  return {
    totalCash: Number(row.total_cash) || 0,
    remaining: Object.fromEntries(LOAD_PREFIXES.map((p) => [p, Number(row[`${p}_remaining`]) || 0])),
  };
}

export async function saveShopRecord(
  row: ShopHistoryRow,
  expenses: ExpenseInput[] = [],
  publishDate?: string,
  note?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to save a record." };

  const values: Record<string, number | string> = {};
  for (const [key, v] of Object.entries(row)) {
    if (!/^[a-z0-9_]+$/.test(key)) return { error: "Invalid field." };
    values[key] = Number(v) || 0;
  }
  if (publishDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) return { error: "Invalid publish date." };
    values.publish_date = publishDate;
  }
  const trimmedNote = String(note ?? "").trim();
  if (trimmedNote) values.note = trimmedNote;
  if (user.email) values.creator_email = user.email;

  const { data: record, error } = await supabase
    .from("shop_history")
    .insert(values)
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (expenses.length > 0) {
    const { error: expError } = await supabase.from("expenses").insert(
      expenses.map((e) => ({
        shop_history_id: record.id,
        name: String(e.name).trim(),
        price: Number(e.price) || 0,
        status: e.status,
      })),
    );
    if (expError) return { error: `Record saved, but expenses failed: ${expError.message}` };
  }

  return {};
}
