import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import BranchesDashboard from "./branches-dashboard";

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <BranchesDashboard />;
}
