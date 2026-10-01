"use server";

import { createClient } from "@/lib/supabase/server";

export type ShopHistoryRow = Record<string, number>;

export async function saveShopRecord(row: ShopHistoryRow): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to save a record." };

  const values: ShopHistoryRow = {};
  for (const [key, v] of Object.entries(row)) {
    if (!/^[a-z0-9_]+$/.test(key)) return { error: "Invalid field." };
    values[key] = Number(v) || 0;
  }

  const { error } = await supabase.from("shop_history").insert(values);
  if (error) return { error: error.message };
  return {};
}
