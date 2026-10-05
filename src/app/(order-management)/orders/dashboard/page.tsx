import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("get_order_dashboard_stats", { p_days: 30 });
  if (error) {
    console.error("Load dashboard stats error:", error);
    throw new Error(error.message || "تعذر تحميل الإحصائيات.");
  }

  return <DashboardClient initialData={data ?? null} />;
}
