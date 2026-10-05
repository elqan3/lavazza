import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const days = Number(new URL(request.url).searchParams.get("days") || "30");
  const { data, error } = await supabase.rpc("get_order_dashboard_stats", { p_days: days });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? {});
}
