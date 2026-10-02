"use server";

import { createClient } from "@/lib/supabase/server";

export type Product = {
  id: number;
  name: string;
  customerPrice: number;
  purchasePiece: number;
  purchaseBox: number;
  creator: string;
  createdAt: string; // ISO timestamp
};

export type ProductInput = {
  name: string;
  customerPrice: number;
  purchasePiece: number;
  purchaseBox: number;
};

const SELECT =
  "id, name, customer_price, purchase_price_piece, purchase_price_box, creator_email, created_at";

type Row = {
  id: number;
  name: string;
  customer_price: number | string;
  purchase_price_piece: number | string;
  purchase_price_box: number | string;
  creator_email: string | null;
  created_at: string;
};

function toProduct(r: Row): Product {
  return {
    id: r.id,
    name: r.name,
    customerPrice: Number(r.customer_price) || 0,
    purchasePiece: Number(r.purchase_price_piece) || 0,
    purchaseBox: Number(r.purchase_price_box) || 0,
    creator: r.creator_email ?? "Unknown",
    createdAt: r.created_at,
  };
}

/** All products, newest first. */
export async function getProducts(): Promise<{ products: Product[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { products: [], error: "You must be logged in to view products." };

  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) return { products: [], error: error.message };
  return { products: (data as Row[]).map(toProduct) };
}

/** Creates a product, or updates product `id` when given. Returns the saved product. */
export async function saveProduct(
  input: ProductInput,
  id?: number,
): Promise<{ product?: Product; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to save a product." };

  const name = String(input.name ?? "").trim();
  if (!name) return { error: "Enter the product name." };
  const prices = [input.customerPrice, input.purchasePiece, input.purchaseBox].map(Number);
  if (prices.some((p) => !Number.isFinite(p) || p < 0)) return { error: "Prices must be 0 or more." };
  const [customer_price, purchase_price_piece, purchase_price_box] = prices;
  const values = { name, customer_price, purchase_price_piece, purchase_price_box };

  const query = id
    ? supabase.from("products").update(values).eq("id", id).select(SELECT).maybeSingle()
    : supabase
        .from("products")
        .insert({ ...values, creator_email: user.email ?? null })
        .select(SELECT)
        .single();
  const { data, error } = await query;
  if (error) return { error: error.message };
  if (!data) return { error: "Product not found." };
  return { product: toProduct(data as Row) };
}

export async function deleteProduct(id: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to delete a product." };

  const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!data.length) return { error: "Product not found." };
  return {};
}
