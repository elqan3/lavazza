import { createClient } from "@/services/supabase/server";

export async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("ADMIN CHECK USER:", user?.id);
  console.log("ADMIN CHECK USER ERROR:", userError);

  if (!user) {
    return false;
  }

  const { data: admin, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("ADMIN RECORD:", admin);
  console.log("ADMIN ERROR:", error);

  return !!admin;
}