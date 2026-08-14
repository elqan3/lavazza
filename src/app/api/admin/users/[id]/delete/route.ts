import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /*
     * Supabase client الخاص بجلسة المستخدم
     */
    const supabase = await createClient();

    /*
     * معرفة المستخدم الحالي
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    /*
     * التأكد أن المستخدم Admin
     */
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !admin) {
      return NextResponse.redirect(
        new URL("/mood-space", request.url)
      );
    }

    /*
     * ID الحساب المراد حذفه
     */
    const { id: userId } = await context.params;

    if (!userId) {
      return NextResponse.redirect(
        new URL("/admin/users", request.url)
      );
    }

    /*
     * منع الأدمن من حذف نفسه
     */
    if (userId === user.id) {
      return NextResponse.redirect(
        new URL("/admin/users?error=cannot-delete-yourself", request.url)
      );
    }

    /*
     * Service Role Client
     *
     * هذا المفتاح يجب أن يكون موجوداً في .env.local
     */
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing"
      );

      return NextResponse.redirect(
        new URL("/admin/users?error=server-config", request.url)
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * حذف المنشورات أولاً
     */
    const { error: postsError } = await adminSupabase
      .from("posts")
      .delete()
      .eq("user_id", userId);

    if (postsError) {
      console.error(
        "DELETE POSTS ERROR:",
        postsError
      );

      return NextResponse.redirect(
        new URL("/admin/users?error=posts-delete-failed", request.url)
      );
    }

    /*
     * حذف likes الخاصة بالمستخدم
     */
    const { error: likesError } = await adminSupabase
      .from("likes")
      .delete()
      .eq("user_id", userId);

    if (likesError) {
      console.error(
        "DELETE LIKES ERROR:",
        likesError
      );

      return NextResponse.redirect(
        new URL("/admin/users?error=likes-delete-failed", request.url)
      );
    }

    /*
     * حذف Profile
     */
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error(
        "DELETE PROFILE ERROR:",
        profileError
      );

      return NextResponse.redirect(
        new URL("/admin/users?error=profile-delete-failed", request.url)
      );
    }

    /*
     * حذف الحساب الحقيقي من Supabase Auth
     */
    const { error: authError } =
      await adminSupabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error(
        "DELETE AUTH USER ERROR:",
        authError
      );

      return NextResponse.redirect(
        new URL("/admin/users?error=auth-delete-failed", request.url)
      );
    }

    /*
     * نجاح العملية
     */
    return NextResponse.redirect(
      new URL("/admin/users?deleted=success", request.url)
    );

  } catch (error) {
    console.error(
      "DELETE USER UNEXPECTED ERROR:",
      error
    );

    return NextResponse.redirect(
      new URL("/admin/users?error=unexpected", request.url)
    );
  }
}