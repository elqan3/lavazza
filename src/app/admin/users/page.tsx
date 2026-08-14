import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";
import DeleteUserButton from "@/features/admin/components/DeleteUserButton";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // التحقق من المستخدم
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // التحقق من صلاحية الأدمن
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/mood-space");
  }

  // جلب المستخدمين
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#0f1d35] px-4 py-10 text-white"
      >
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-xl font-bold">
              حدث خطأ أثناء تحميل المستخدمين
            </h1>

            <p className="mt-3 text-sm text-white/60">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const users = profiles ?? [];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0f1d35] px-4 py-8 text-white"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-semibold text-[#d4af37]">
              LAVAZA ADMIN
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              إدارة المستخدمين
            </h1>

            <p className="mt-2 text-sm text-white/50">
              التحكم في أعضاء مجتمع Lavaza Mood
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <Link
              href="/admin"
              className="
                rounded-full
                border
                border-white/10
                bg-white/5
                px-5
                py-3
                text-sm
                font-semibold
                transition
                hover:bg-white/10
                active:scale-95
              "
            >
              لوحة التحكم
            </Link>

            <Link
              href="/admin/mood"
              className="
                rounded-full
                bg-[#d4af37]
                px-5
                py-3
                text-sm
                font-bold
                text-[#16284a]
                transition
                hover:brightness-105
                active:scale-95
              "
            >
              Mood Space
            </Link>

          </div>
        </header>


        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-[#16284a] p-6 shadow-xl">

            <p className="text-sm text-white/50">
              إجمالي المستخدمين
            </p>

            <p className="mt-2 text-4xl font-bold text-[#d4af37]">
              {users.length}
            </p>

          </div>


          <div className="rounded-3xl border border-white/10 bg-[#16284a] p-6 shadow-xl">

            <p className="text-sm text-white/50">
              حالة النظام
            </p>

            <p className="mt-2 text-lg font-bold text-green-400">
              النظام يعمل
            </p>

          </div>

        </section>


        {/* Section title */}
        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold">
              المستخدمون
            </h2>

            <p className="mt-1 text-xs text-white/40">
              أحدث الحسابات تظهر أولًا
            </p>
          </div>

          <span className="rounded-full bg-white/5 px-4 py-2 text-xs text-white/50">
            {users.length} حساب
          </span>

        </div>


        {/* Users */}
        <section className="space-y-4">

          {users.map((profile) => (

            <article
              key={profile.id}
              className="
                overflow-hidden
                rounded-[2rem]
                border
                border-white/10
                bg-[#16284a]
                p-5
                shadow-xl
                transition
                hover:border-white/20
              "
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                {/* User information */}
                <div className="flex min-w-0 items-center gap-4">

                  <Image
                    src={profile.avatar_url || "/avatar.png"}
                    alt={profile.full_name || "Lavaza User"}
                    width={72}
                    height={72}
                    className="
                      h-[72px]
                      w-[72px]
                      shrink-0
                      rounded-full
                      border-2
                      border-[#d4af37]
                      object-cover
                    "
                  />

                  <div className="min-w-0">

                    <h3 className="truncate text-lg font-bold">
                      {profile.full_name || "بدون اسم"}
                    </h3>

                    {profile.username && (
                      <p className="mt-1 text-sm text-[#d4af37]">
                        @{profile.username}
                      </p>
                    )}

                    {profile.bio && (
                      <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-white/50">
                        {profile.bio}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-white/30">
                      عضو منذ{" "}
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "ar-LY"
                          )
                        : "غير معروف"}
                    </p>

                  </div>

                </div>


                {/* Actions */}
                <div className="flex shrink-0 flex-wrap gap-2">

                  <Link
                    href={`/profile/${profile.id}`}
                    className="
                      rounded-full
                      bg-white/10
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      transition
                      hover:bg-white/15
                      active:scale-95
                    "
                  >
                    الملف الشخصي
                  </Link>


      <DeleteUserButton
  userId={profile.id}
  userName={profile.full_name || "هذا المستخدم"}
/>

                </div>

              </div>


              {/* User ID */}
              <div className="mt-5 border-t border-white/5 pt-4">

                <p
                  dir="ltr"
                  className="truncate text-left text-[10px] text-white/20"
                >
                  {profile.id}
                </p>

              </div>

            </article>

          ))}


          {/* Empty state */}
          {users.length === 0 && (

            <div className="rounded-[2rem] border border-white/10 bg-[#16284a] p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">
                👤
              </div>

              <h3 className="mt-5 text-lg font-bold">
                لا يوجد مستخدمون
              </h3>

              <p className="mt-2 text-sm text-white/40">
                لم يتم إنشاء أي حسابات حتى الآن.
              </p>

            </div>

          )}

        </section>

      </div>
    </main>
  );
}