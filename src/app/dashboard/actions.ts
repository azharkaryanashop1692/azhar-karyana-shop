"use server";

import { createClient } from "@/lib/supabase/server";

export type ShopHistoryRow = Record<string, number>;
export type ExpenseInput = { name: string; price: number; status: "Load" | "Other" };

/** The current user's saved Shop Needs text ("" if none). */
export async function getShopNeeds(): Promise<{ text: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { text: "", error: "You must be logged in." };

  const { data, error } = await supabase.from("users").select("shop_needs").eq("id", user.id).maybeSingle();
  if (error) return { text: "", error: error.message };
  return { text: data?.shop_needs ?? "" };
}

/** Saves `text` into the current user's users.shop_needs. */
export async function saveShopNeeds(text: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { error } = await supabase
    .from("users")
    .upsert({ id: user.id, email: user.email, shop_needs: String(text) });
  if (error) return { error: error.message };
  return {};
}

export type ShopHistoryRecord = {
  id: number;
  publishDate: string; // YYYY-MM-DD
  creator: string;
  totalCash: number;
  totalSale: number;
  note: string;
  /** Full record (all columns + expenses), so Edit can fill the form without another request. */
  detail: ShopRecordDetail;
};

type ExpenseRow = { id: number; name: string; price: number | string; status: "Load" | "Other" };

/** shop_history row (with embedded expenses) -> ShopRecordDetail. */
function toDetail(row: Record<string, unknown>): ShopRecordDetail {
  const values: Record<string, number> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "number" || typeof v === "string") values[k] = Number(v) || 0;
  }
  const expenses = ((row.expenses as ExpenseRow[] | null) ?? [])
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((e) => ({ name: e.name, price: Number(e.price) || 0, status: e.status }));
  return {
    values,
    publishDate: String(row.publish_date),
    note: (row.note as string | null) ?? "",
    expenses,
  };
}

/** All shop_history records, newest publish date first. */
export async function getShopHistory(): Promise<{ records: ShopHistoryRecord[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { records: [], error: "You must be logged in to view history." };

  const { data, error } = await supabase
    .from("shop_history")
    .select("*, expenses(id, name, price, status)")
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
      detail: toDetail(r),
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

export type ShopRecordDetail = {
  /** Raw shop_history column values (numbers). */
  values: Record<string, number>;
  publishDate: string;
  note: string;
  expenses: ExpenseInput[];
};

/** One shop_history record with its expenses, for editing. */
export async function getShopRecord(
  id: number,
): Promise<{ record?: ShopRecordDetail; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to edit a record." };

  const { data, error } = await supabase
    .from("shop_history")
    .select("*, expenses(id, name, price, status)")
    .eq("id", id)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Record not found." };
  return { record: toDetail(data) };
}

export async function deleteShopRecord(id: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to delete a record." };

  // Linked expenses are removed by the foreign key's ON DELETE CASCADE.
  const { data, error } = await supabase.from("shop_history").delete().eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!data.length) return { error: "Record not found." };
  return {};
}

/** Inserts a new record, or updates record `id` when given. */
export async function saveShopRecord(
  row: ShopHistoryRow,
  expenses: ExpenseInput[] = [],
  publishDate?: string,
  note?: string,
  id?: number,
): Promise<{ error?: string; duplicate?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to save a record." };

  const values: Record<string, number | string | null> = {};
  for (const [key, v] of Object.entries(row)) {
    if (!/^[a-z0-9_]+$/.test(key)) return { error: "Invalid field." };
    values[key] = Number(v) || 0;
  }
  if (publishDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) return { error: "Invalid publish date." };
    values.publish_date = publishDate;
  }
  const trimmedNote = String(note ?? "").trim();
  values.note = trimmedNote || null;

  // Only one record per publish date (defaults to today in the DB).
  const date = publishDate || new Date().toISOString().slice(0, 10);
  const [y, m, d] = date.split("-");
  const duplicateError = { error: `already record saved for the ${m}/${d}/${y}.`, duplicate: true };
  let dupQuery = supabase.from("shop_history").select("id").eq("publish_date", date).limit(1);
  if (id) dupQuery = dupQuery.neq("id", id);
  const { data: existing, error: dupError } = await dupQuery;
  if (dupError) return { error: dupError.message };
  if (existing.length) return duplicateError;

  let record: { id: number };
  if (id) {
    // Update keeps the original creator; its expenses are replaced below.
    const { data, error } = await supabase
      .from("shop_history")
      .update(values)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return error.code === "23505" ? duplicateError : { error: error.message };
    if (!data) return { error: "Record not found." };
    record = data;

    const { error: delError } = await supabase.from("expenses").delete().eq("shop_history_id", id);
    if (delError) return { error: `Record updated, but expenses failed: ${delError.message}` };
  } else {
    if (user.email) values.creator_email = user.email;
    const { data, error } = await supabase.from("shop_history").insert(values).select("id").single();
    if (error) return error.code === "23505" ? duplicateError : { error: error.message };
    record = data;
  }

  if (expenses.length > 0) {
    const { error: expError } = await supabase.from("expenses").insert(
      expenses.map((e) => ({
        shop_history_id: record.id,
        name: String(e.name).trim(),
        price: Number(e.price) || 0,
        status: e.status,
      })),
    );
    if (expError) {
      return { error: `Record ${id ? "updated" : "saved"}, but expenses failed: ${expError.message}` };
    }
  }

  return {};
}
