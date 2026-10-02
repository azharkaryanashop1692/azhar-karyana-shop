"use server";

import { createClient } from "@/lib/supabase/server";

export type OrderItem = { name: string; price: number };

export type Order = {
  id: number;
  name: string;
  price: number;
  creator: string;
  createdAt: string; // ISO timestamp
  items: OrderItem[];
};

/** All orders with their items, newest first. */
export async function getOrders(): Promise<{ orders: Order[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { orders: [], error: "You must be logged in to view orders." };

  const { data, error } = await supabase
    .from("orders")
    .select("id, name, price, creator_email, created_at, order_items(name, price, id)")
    .order("created_at", { ascending: false })
    .order("id", { referencedTable: "order_items" });
  if (error) return { orders: [], error: error.message };

  return {
    orders: data.map((o) => ({
      id: o.id,
      name: o.name,
      price: Number(o.price) || 0,
      creator: o.creator_email ?? "Unknown",
      createdAt: o.created_at,
      items: (o.order_items ?? []).map((i) => ({ name: i.name, price: Number(i.price) || 0 })),
    })),
  };
}

/** Creates an order, or updates order `id` (replacing its items) when given. */
export async function saveOrder(
  name: string,
  items: OrderItem[],
  id?: number,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to save an order." };

  const orderName = String(name ?? "").trim();
  if (!orderName) return { error: "Enter an order name." };
  const cleanItems = items
    .map((i) => ({ name: String(i.name ?? "").trim(), price: Number(i.price) }))
    .filter((i) => i.name);
  if (!cleanItems.length) return { error: "Add at least one item." };
  if (cleanItems.some((i) => !Number.isFinite(i.price) || i.price < 0)) {
    return { error: "Item prices must be 0 or more." };
  }
  // Order price = sum of all items' prices.
  const price = cleanItems.reduce((a, i) => a + i.price, 0);

  let orderId: number;
  if (id) {
    const { data, error } = await supabase
      .from("orders")
      .update({ name: orderName, price })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: "Order not found." };
    orderId = data.id;

    const { error: delError } = await supabase.from("order_items").delete().eq("order_id", id);
    if (delError) return { error: `Order updated, but items failed: ${delError.message}` };
  } else {
    const { data, error } = await supabase
      .from("orders")
      .insert({ name: orderName, price, creator_email: user.email ?? null })
      .select("id")
      .single();
    if (error) return { error: error.message };
    orderId = data.id;
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(cleanItems.map((i) => ({ order_id: orderId, name: i.name, price: i.price })));
  if (itemsError) {
    return { error: `Order ${id ? "updated" : "created"}, but items failed: ${itemsError.message}` };
  }
  return {};
}

export async function deleteOrder(id: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to delete an order." };

  // The order's items are removed by the foreign key's ON DELETE CASCADE.
  const { data, error } = await supabase.from("orders").delete().eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!data.length) return { error: "Order not found." };
  return {};
}
