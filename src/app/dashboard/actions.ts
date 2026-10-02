"use server";

import { createClient } from "@/lib/supabase/server";

export type ShopHistoryRow = Record<string, number>;
export type ExpenseInput = { name: string; price: number; status: "Load" | "Other" };

/** Total Cash of the latest shop_history record published before `beforeDate` (YYYY-MM-DD). */
export async function getPreviousCash(beforeDate: string): Promise<number> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(beforeDate)) return 0;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("shop_history")
    .select("total_cash")
    .lt("publish_date", beforeDate)
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return Number(data?.total_cash) || 0;
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
