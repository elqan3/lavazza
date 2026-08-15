import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=google_auth`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Google OAuth error:", error);

    return NextResponse.redirect(`${origin}/login?error=google_auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  // البحث عن Profile المستخدم
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile lookup error:", profileError);

    return NextResponse.redirect(`${origin}/login?error=profile`);
  }

  // مستخدم Google جديد أو حسابه لم يكتمل
  if (!profile || !profile.phone) {
    return NextResponse.redirect(`${origin}/auth/complete`);
  }

  // الحساب مكتمل
  return NextResponse.redirect(`${origin}/mood-space`);
}