import { redirect } from "next/navigation";
import { supabase } from "@/services/supabase/client";

export default async function Me() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  redirect(`/profile/${user.id}`);
}