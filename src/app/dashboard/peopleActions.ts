"use server";

import { createClient } from "@/lib/supabase/server";
import { PERSON_STATUSES, type PersonStatus } from "@/lib/personStatus";
import type { OrderItem } from "./orderActions";

export type Person = {
  id: number;
  name: string;
  phone: string;
  location: string;
  status: PersonStatus;
  totalPrice: number;
  note: string;
  creator: string;
  createdAt: string; // ISO timestamp
  items: OrderItem[];
};

export type PersonInput = {
  name: string;
  phone: string;
  location: string;
  status: PersonStatus;
  note: string;
  items: OrderItem[];
};

const SELECT =
  "id, name, phone, location, status, total_price, note, creator_email, created_at, order_items(id, name, price)";

type Row = {
  id: number;
  name: string;
  phone: string | null;
  location: string | null;
  status: PersonStatus;
  total_price: number | string;
  note: string | null;
  creator_email: string | null;
  created_at: string;
  order_items: { name: string; price: number | string }[] | null;
};

function toPerson(r: Row): Person {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? "",
    location: r.location ?? "",
    status: r.status,
    totalPrice: Number(r.total_price) || 0,
    note: r.note ?? "",
    creator: r.creator_email ?? "Unknown",
    createdAt: r.created_at,
    items: (r.order_items ?? []).map((i) => ({ name: i.name, price: Number(i.price) || 0 })),
  };
}

/** All people records with their items, newest first. */
export async function getPeople(): Promise<{ people: Person[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { people: [], error: "You must be logged in to view people." };

  const { data, error } = await supabase
    .from("people_records")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .order("id", { referencedTable: "order_items" });
  if (error) return { people: [], error: error.message };
  return { people: (data as unknown as Row[]).map(toPerson) };
}

/** Creates a person, or updates person `id` (replacing their items) when given. Returns the saved person. */
export async function savePerson(
  input: PersonInput,
  id?: number,
): Promise<{ person?: Person; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to save a person." };

  const name = String(input.name ?? "").trim();
  if (!name) return { error: "Enter the person's name." };
  if (!PERSON_STATUSES.includes(input.status)) return { error: "Choose a valid status." };
  const items = (input.items ?? [])
    .map((i) => ({ name: String(i.name ?? "").trim(), price: Number(i.price) }))
    .filter((i) => i.name);
  if (items.some((i) => !Number.isFinite(i.price) || i.price < 0)) {
    return { error: "Item prices must be 0 or more." };
  }

  const values = {
    name,
    phone: String(input.phone ?? "").trim() || null,
    location: String(input.location ?? "").trim() || null,
    status: input.status,
    note: String(input.note ?? "").trim() || null,
    // Total price = sum of all items' prices.
    total_price: items.reduce((a, i) => a + i.price, 0),
  };

  let personId: number;
  if (id) {
    const { data, error } = await supabase
      .from("people_records")
      .update(values)
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: "Person not found." };
    personId = data.id;

    const { error: delError } = await supabase.from("order_items").delete().eq("person_id", id);
    if (delError) return { error: `Person updated, but items failed: ${delError.message}` };
  } else {
    const { data, error } = await supabase
      .from("people_records")
      .insert({ ...values, creator_email: user.email ?? null })
      .select("id")
      .single();
    if (error) return { error: error.message };
    personId = data.id;
  }

  if (items.length) {
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items.map((i) => ({ person_id: personId, name: i.name, price: i.price })));
    if (itemsError) {
      return { error: `Person ${id ? "updated" : "created"}, but items failed: ${itemsError.message}` };
    }
  }

  const { data, error } = await supabase
    .from("people_records")
    .select(SELECT)
    .eq("id", personId)
    .order("id", { referencedTable: "order_items" })
    .single();
  if (error) return { error: error.message };
  return { person: toPerson(data as unknown as Row) };
}

export async function deletePerson(id: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to delete a person." };

  // The person's items are removed by the foreign key's ON DELETE CASCADE.
  const { data, error } = await supabase.from("people_records").delete().eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!data.length) return { error: "Person not found." };
  return {};
}
