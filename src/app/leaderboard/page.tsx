import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/services/supabase/server";
import { redirect } from "next/navigation";
import { Trophy, Flame, Crown, Medal } from "lucide-react";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leaders, error } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(10);

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#0b1428] px-5 py-10 text-white"
      >
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-xl font-bold">
              حدث خطأ أثناء تحميل قائمة المتصدرين
            </h1>

            <p className="mt-3 text-sm text-white/60">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const users = leaders ?? [];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0b1428] px-4 py-8 text-white"
    >
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <header className="mb-10 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-[#d4af37]">
            <Trophy size={32} />
          </div>

          <h1 className="mt-5 text-3xl font-black">
            قائمة المتصدرين
          </h1>

          <p className="mt-2 text-sm text-white/50">
            أكثر أعضاء Lavaza نشاطًا
          </p>

        </header>


        {/* Top 3 */}
        {users.length > 0 && (
          <section className="mb-10 grid gap-4 md:grid-cols-3">

            {users.slice(0, 3).map((profile) => {

              const isFirst = profile.rank === 1;
              const isSecond = profile.rank === 2;
              const isThird = profile.rank === 3;

              return (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.id}`}
                  className={`
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border
                    p-6
                    text-center
                    transition
                    hover:-translate-y-1
                    ${
                      isFirst
                        ? "border-[#d4af37]/50 bg-[#d4af37]/10 md:-translate-y-3"
                        : "border-white/10 bg-[#16284a]"
                    }
                  `}
                >

                  {/* Rank */}
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-black">

                    {isFirst && <Crown size={23} className="text-[#d4af37]" />}
                    {isSecond && <Medal size={23} className="text-white/80" />}
                    {isThird && <Medal size={23} className="text-orange-400" />}

                  </div>


                  {/* Avatar */}
                  <div className="relative mx-auto mt-5 h-24 w-24">

                    <Image
                      src={profile.avatar_url || "/avatar.png"}
                      alt={profile.full_name || "Lavaza User"}
                      fill
                      sizes="96px"
                      className={`
                        rounded-full
                        object-cover
                        border-4
                        ${
                          isFirst
                            ? "border-[#d4af37]"
                            : isSecond
                            ? "border-white/40"
                            : "border-orange-400/60"
                        }
                      `}
                    />

                  </div>


                  {/* Name */}
                  <h2 className="mt-5 truncate text-lg font-black">
                    {profile.full_name || "بدون اسم"}
                  </h2>

                  {profile.username && (
                    <p className="mt-1 text-sm text-[#d4af37]">
                      @{profile.username}
                    </p>
                  )}


                  {/* Rank */}
                  <p className="mt-4 text-sm font-bold text-white/50">
                    المركز {profile.rank}
                  </p>


                  {/* Points */}
                  <p className="mt-1 text-2xl font-black text-[#d4af37]">
                    {profile.points}
                    <span className="mr-1 text-xs font-semibold text-white/40">
                      نقطة
                    </span>
                  </p>


                  {/* Streak */}
                  {profile.login_streak > 0 && (
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs text-orange-400">
                      <Flame size={14} />
                      {profile.login_streak} أيام متواصلة
                    </div>
                  )}

                </Link>
              );
            })}

          </section>
        )}


        {/* Remaining users */}
        {users.length > 3 && (
          <section className="space-y-3">

            {users.slice(3).map((profile) => (

              <Link
                key={profile.id}
                href={`/profile/${profile.id}`}
                className="
                  flex
                  items-center
                  gap-4
                  rounded-3xl
                  border
                  border-white/10
                  bg-[#16284a]
                  p-4
                  transition
                  hover:border-[#d4af37]/30
                  hover:bg-[#1a3159]
                "
              >

                {/* Rank */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-black text-white/50">
                  #{profile.rank}
                </div>


                {/* Avatar */}
                <div className="relative h-14 w-14 shrink-0">

                  <Image
                    src={profile.avatar_url || "/avatar.png"}
                    alt={profile.full_name || "Lavaza User"}
                    fill
                    sizes="56px"
                    className="rounded-full border border-white/10 object-cover"
                  />

                </div>


                {/* User */}
                <div className="min-w-0 flex-1">

                  <h3 className="truncate font-bold">
                    {profile.full_name || "بدون اسم"}
                  </h3>

                  {profile.username && (
                    <p className="mt-1 truncate text-xs text-[#d4af37]">
                      @{profile.username}
                    </p>
                  )}

                </div>


                {/* Points */}
                <div className="text-left">

                  <p className="text-lg font-black text-[#d4af37]">
                    {profile.points}
                  </p>

                  <p className="text-[10px] text-white/30">
                    نقطة
                  </p>

                </div>

              </Link>

            ))}

          </section>
        )}


        {/* Empty */}
        {users.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-[#16284a] p-12 text-center">

            <Trophy
              size={40}
              className="mx-auto text-white/20"
            />

            <h2 className="mt-5 text-lg font-bold">
              لا توجد بيانات بعد
            </h2>

          </div>
        )}


        {/* Back */}
        <div className="mt-10 text-center">

          <Link
            href="/mood-space"
            className="
              inline-flex
              rounded-full
              border
              border-white/10
              bg-white/5
              px-6
              py-3
              text-sm
              font-semibold
              text-white/70
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            العودة إلى Mood Space
          </Link>

        </div>

      </div>
    </main>
  );
}