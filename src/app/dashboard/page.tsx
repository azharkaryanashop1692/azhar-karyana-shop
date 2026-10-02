import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { getShopHistory, getShopNeeds } from "./actions";
import { getOrders } from "./orderActions";
import { getPeople } from "./peopleActions";
import { getProducts } from "./productActions";

export default async function DashboardPage() {
  // The proxy already redirects signed-out users; verify again here so the
  // page is never rendered without a valid session.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Preload Shop History so that screen shows data immediately.
  const [
    { records, error },
    { text: shopNeeds },
    { orders, error: ordersError },
    { people, error: peopleError },
    { products, error: productsError },
  ] = await Promise.all([getShopHistory(), getShopNeeds(), getOrders(), getPeople(), getProducts()]);

  return (
    <DashboardLayout
      userEmail={user.email ?? ""}
      initialHistory={error ? null : records}
      initialShopNeeds={shopNeeds}
      initialOrders={ordersError ? null : orders}
      initialPeople={peopleError ? null : people}
      initialProducts={productsError ? null : products}
    />
  );
}
