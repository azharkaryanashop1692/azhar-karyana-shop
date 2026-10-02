import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { getShopHistory } from "./actions";

export default async function DashboardPage() {
  // The proxy already redirects signed-out users; verify again here so the
  // page is never rendered without a valid session.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Preload Shop History so that screen shows data immediately.
  const { records, error } = await getShopHistory();

  return <DashboardLayout userEmail={user.email ?? ""} initialHistory={error ? null : records} />;
}
