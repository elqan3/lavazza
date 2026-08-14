import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const supabase = await createClient();

  // المستخدم الحالي
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // التحقق من الأدمن
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 403,
      }
    );
  }

  const { id } = await context.params;

  // حذف المنشور
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "ADMIN DELETE POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }

  // العودة للوحة Mood Space
  return NextResponse.redirect(
    new URL("/admin/mood", request.url)
  );
}