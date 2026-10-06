import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Home, Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leaders, error } = await supabase
    .from("leaderboard")
    .select("id, rank, points, full_name, username, avatar_url, login_streak")
    .limit(10);

  const users = leaders ?? [];

  return (
    <main dir="rtl" className="min-h-[100dvh] bg-[#f6f3ed] pb-10 text-[#16284a]">
      <div className="mx-auto w-full max-w-xl px-4 pt-4">
        <header className="flex items-center justify-between rounded-2xl border border-[#16284a]/8 bg-white px-3 py-3 shadow-sm">
          <Link href="/mood-space" aria-label="العودة إلى لحظات لافازا" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f3ed] text-[#16284a] transition active:scale-95">
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b58b22]">Lavaza</p>
            <h1 className="text-sm font-black">المتصدرون</h1>
          </div>

          <Link href={\`/profile/\${user.id}\`} aria-label="ملفي الشخصي" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/35 bg-[#f6f3ed]">
            <Image src="/avatar.png" alt="" width={40} height={40} className="h-full w-full object-cover" />
          </Link>
        </header>

        <section className="mt-5 rounded-[1.75rem] bg-[#16284a] px-5 py-6 text-white shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#d4af37]">
              <Trophy size={23} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#d4af37]">مجتمع Lavaza</p>
              <h2 className="mt-1 text-2xl font-black">من الأكثر نشاطًا؟</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">ترتيب الأعضاء حسب النقاط المكتسبة.</p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-[1.5rem] bg-white p-8 text-center">
            <p className="font-bold">تعذر تحميل المتصدرين</p>
            <p className="mt-2 text-sm text-[#16284a]/50">حاول تحديث الصفحة مرة أخرى.</p>
          </div>
        ) : users.length > 0 ? (
          <section className="mt-5 space-y-2">
            {users.map((profile) => {
              const top = profile.rank <= 3;
              const rankClass =
                profile.rank === 1
                  ? "bg-[#d4af37]/15 text-[#a77b0b]"
                  : profile.rank === 2
                  ? "bg-[#16284a]/8 text-[#16284a]/65"
                  : profile.rank === 3
                  ? "bg-orange-100 text-orange-700"
                  : "bg-[#f6f3ed] text-[#16284a]/45";

              return (
                <Link
                  key={profile.id}
                  href={\`/profile/\${profile.id}\`}
                  className={
                    "flex items-center gap-3 rounded-2xl border bg-white p-3 transition active:scale-[0.99] " +
                    (top ? "border-[#d4af37]/25" : "border-[#16284a]/8")
                  }
                >
                  <div className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black " + rankClass}>
                    #{profile.rank}
                  </div>

                  <Image
                    src={profile.avatar_url || "/avatar.png"}
                    alt=""
                    width={48}
                    height={48}
                    className={
                      "h-12 w-12 shrink-0 rounded-full object-cover " +
                      (top ? "border-2 border-[#d4af37]/30" : "border border-[#16284a]/8")
                    }
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{profile.full_name || "عضو Lavaza"}</p>
                    {profile.username && <p className="mt-0.5 truncate text-[11px] text-[#b58b22]">@{profile.username}</p>}
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-black text-[#b58b22]">{profile.points}</p>
                    <p className="text-[10px] text-[#16284a]/35">نقطة</p>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <div className="mt-5 rounded-[1.5rem] bg-white p-10 text-center">
            <Trophy size={36} className="mx-auto text-[#b58b22]/50" />
            <p className="mt-4 font-bold">لا توجد بيانات بعد</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link href="/mood-space" className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#16284a] text-sm font-bold text-white">
            <ArrowLeft size={16} />
            لحظات لافازا
          </Link>
          <Link href="/home" className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#16284a]/10 bg-white text-sm font-semibold text-[#16284a]/70">
            <Home size={16} />
            الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
