import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

type PushSubscriptionBody = {
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  endpoint?: string;
};

async function getAuthorizedStaff() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { response: NextResponse.json({ error: "يجب تسجيل الدخول أولاً." }, { status: 401 }) };
  }

  const { data: allowed, error: roleError } = await supabase.rpc("has_order_role", {
    p_roles: ["staff", "manager", "owner"],
  });

  if (roleError || allowed !== true) {
    return { response: NextResponse.json({ error: "غير مصرح لك بتفعيل إشعارات الموظفين." }, { status: 403 }) };
  }

  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await getAuthorizedStaff();
  if ("response" in auth) return auth.response;

  let body: PushSubscriptionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات الاشتراك غير صالحة." }, { status: 400 });
  }

  const subscription = body.subscription;
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const authKey = subscription?.keys?.auth;

  if (
    typeof endpoint !== "string" ||
    !endpoint.startsWith("https://") ||
    typeof p256dh !== "string" ||
    typeof authKey !== "string"
  ) {
    return NextResponse.json({ error: "بيانات الاشتراك ناقصة أو غير صالحة." }, { status: 400 });
  }

  const { error: deleteError } = await auth.supabase
    .from("staff_push_subscriptions")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("endpoint", endpoint);

  if (deleteError) {
    console.error("Delete previous push subscription failed:", deleteError);
    return NextResponse.json({ error: "تعذر تحديث اشتراك الإشعارات." }, { status: 500 });
  }

  const { error: insertError } = await auth.supabase
    .from("staff_push_subscriptions")
    .insert({
      user_id: auth.user.id,
      endpoint,
      p256dh,
      auth: authKey,
      user_agent: request.headers.get("user-agent"),
    });

  if (insertError) {
    console.error("Save push subscription failed:", insertError);
    return NextResponse.json({ error: "تعذر حفظ اشتراك الإشعارات." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await getAuthorizedStaff();
  if ("response" in auth) return auth.response;

  let body: PushSubscriptionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  if (typeof body.endpoint !== "string" || !body.endpoint.startsWith("https://")) {
    return NextResponse.json({ error: "عنوان الاشتراك غير صالح." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("staff_push_subscriptions")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("endpoint", body.endpoint);

  if (error) {
    console.error("Remove push subscription failed:", error);
    return NextResponse.json({ error: "تعذر إيقاف الإشعارات." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
