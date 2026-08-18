"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { ArrowRight, Settings, Trophy, Flame, LogOut } from "lucide-react";
import { MessageSquare } from "lucide-react";

type Props = {
  userId: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  login_streak: number;
};

type LeaderboardProfile = {
  id: string;
  rank: number;
  points: number;
};

export default function ProfileHeader({ userId }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      // المستخدم الحالي
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);

      // بيانات البروفايل
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, username, avatar_url, bio, points, login_streak"
        )
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // جلب ترتيب المستخدم
      const { data: leaderboardData, error: leaderboardError } =
        await supabase
          .from("leaderboard")
          .select("id, rank, points")
          .eq("id", userId)
          .maybeSingle();

      if (!leaderboardError && leaderboardData) {
        setRank(leaderboardData.rank);
      } else {
        setRank(null);
      }

      // عدد المنشورات
      const { count } = await supabase
        .from("posts")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", userId);

      setPostCount(count ?? 0);

      setLoading(false);
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <section className="px-4">
        <div className="mx-auto w-full max-w-xl animate-pulse rounded-[2rem] border border-white/10 bg-[#16284a] p-6">
          <div className="mx-auto h-[120px] w-[120px] rounded-full bg-white/10" />

          <div className="mx-auto mt-5 h-6 w-40 rounded-full bg-white/10" />

          <div className="mx-auto mt-3 h-4 w-24 rounded-full bg-white/10" />

          <div className="mt-6 h-16 rounded-2xl bg-white/5" />

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="h-20 rounded-2xl bg-white/5" />
            <div className="h-20 rounded-2xl bg-white/5" />
          </div>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="px-4">
        <div className="mx-auto max-w-xl rounded-3xl bg-[#16284a] p-8 text-center text-white/60">
          المستخدم غير موجود
        </div>
      </section>
    );
  }
async function handleLogout() {
  const confirmed = window.confirm(
    "هل أنت متأكد أنك تريد تسجيل الخروج؟"
  );

  if (!confirmed) return;

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("LOGOUT ERROR:", error);
    alert("حدث خطأ أثناء تسجيل الخروج");
    return;
  }

  window.location.href = "/login";
}
  const isOwner = currentUserId === userId;

  const isTopThree = rank !== null && rank >= 1 && rank <= 3;
  const isTopTen = rank !== null && rank >= 1 && rank <= 10;

  function getRankTitle() {
    if (rank === 1) return "الأكثر نشاطًا";
    if (rank === 2) return "المركز الثاني";
    if (rank === 3) return "المركز الثالث";
    if (rank !== null && rank <= 10) return `من أفضل ${rank} مستخدمين`;
    return null;
  }

  function getRankEmoji() {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank !== null && rank <= 10) return "🏆";
    return null;
  }

  return (
    <section className="px-4">
      <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#16284a] p-6 text-center shadow-2xl">

        {/* العودة إلى Mood Space */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/mood-space"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-full
              bg-white/5
              text-white/70
              transition
              hover:bg-white/10
              hover:text-white
              active:scale-90
            "
            aria-label="العودة إلى Mood Space"
          >
            <ArrowRight size={20} />
          </Link>

          <span className="text-sm font-semibold text-white/40">
            Lavaza Mood
          </span>

          <div className="h-10 w-10" />
        </div>

        {/* Rank Badge */}
        {isTopTen && (
          <Link
            href="/leaderboard"
            className={`
              mx-auto mb-6 flex w-fit items-center gap-2 rounded-full px-5 py-2.5
              text-sm font-bold transition active:scale-95
              ${
                rank === 1
                  ? "border border-yellow-300/40 bg-yellow-400/15 text-yellow-300 shadow-lg shadow-yellow-500/10"
                  : rank === 2
                  ? "border border-gray-300/30 bg-gray-300/10 text-gray-200"
                  : rank === 3
                  ? "border border-orange-400/30 bg-orange-400/10 text-orange-300"
                  : "border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]"
              }
            `}
          >
            <Trophy size={17} />

            <span>
              {getRankEmoji()} {getRankTitle()}
            </span>
          </Link>
        )}

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">

            <div
              className={`
                rounded-full p-1
                ${
                  rank === 1
                    ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 shadow-xl shadow-yellow-500/20"
                    : rank === 2
                    ? "bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600"
                    : rank === 3
                    ? "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700"
                    : "bg-[#d4af37]"
                }
              `}
            >
              {profile.avatar_url ? (
  <img
    src={profile.avatar_url}
    alt={profile.full_name || "Lavaza User"}
    width={120}
    height={120}
    className="
      h-[120px]
      w-[120px]
      rounded-full
      border-4
      border-[#16284a]
      object-cover
      shadow-xl
    "
  />
) : (
  <Image
    src="/avatar.png"
    alt={profile.full_name || "Lavaza User"}
    width={120}
    height={120}
    className="
      h-[120px]
      w-[120px]
      rounded-full
      border-4
      border-[#16284a]
      object-cover
      shadow-xl
    "
  />
)}
            </div>

            <div
              className="
                absolute
                bottom-1
                right-1
                h-5
                w-5
                rounded-full
                border-4
                border-[#16284a]
                bg-green-400
              "
            />
          </div>
        </div>

        {/* Name */}
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-white">
            {profile.full_name || "Lavaza Member"}
          </h1>

          {profile.username && (
            <p className="mt-1 text-sm text-[#d4af37]">
              @{profile.username}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="mt-5 rounded-2xl bg-white/5 px-5 py-4">
          <p className="text-sm leading-7 text-white/70">
            {profile.bio?.trim()
              ? profile.bio
              : "عضو في مجتمع Lavaza Mood ☕"}
          </p>
        </div>

        {/* Points */}
        <div
          className={`
            mt-5 rounded-2xl border p-5
            ${
              rank === 1
                ? "border-yellow-400/20 bg-yellow-400/10"
                : rank === 2
                ? "border-gray-300/20 bg-gray-300/5"
                : rank === 3
                ? "border-orange-400/20 bg-orange-400/10"
                : "border-white/5 bg-white/5"
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy
              size={20}
              className={
                rank === 1
                  ? "text-yellow-300"
                  : rank === 2
                  ? "text-gray-300"
                  : rank === 3
                  ? "text-orange-300"
                  : "text-[#d4af37]"
              }
            />

            <span className="text-3xl font-black text-[#d4af37]">
              {profile.points}
            </span>

            <span className="text-sm font-semibold text-white/50">
              نقطة
            </span>
          </div>

          {rank && (
            <p className="mt-2 text-xs text-white/40">
              الترتيب الحالي #{rank}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-2xl font-bold text-[#d4af37]">
              {postCount}
            </p>

            <p className="mt-1 text-xs text-white/50">
              منشور
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-2xl font-bold text-[#d4af37]">
              {profile.points}
            </p>

            <p className="mt-1 text-xs text-white/50">
              نقطة
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center justify-center gap-1">
              <Flame
                size={18}
                className="text-orange-400"
              />

              <span className="text-2xl font-bold text-orange-400">
                {profile.login_streak}
              </span>
            </div>

            <p className="mt-1 text-xs text-white/50">
              أيام متواصلة
            </p>
          </div>

        </div>
{/* Feedback */}

{isOwner && (
  <Link
    href="/feedback"
    className="
      mt-6
      flex
      w-full
      items-center
      justify-center
      gap-2
      rounded-full
      border
      border-white/10
      bg-white/5
      py-3.5
      font-bold
      text-white/70
      transition
      hover:bg-white/10
      hover:text-white
      active:scale-[0.97]
    "
  >
    <MessageSquare size={18} />
    شاركنا رأيك
  </Link>
)}
        {/* Leaderboard link */}
        <Link
          href="/leaderboard"
          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-[#d4af37]/20
            bg-[#d4af37]/10
            py-3.5
            font-bold
            text-[#d4af37]
            transition
            hover:bg-[#d4af37]/15
            active:scale-[0.97]
          "
        >
          <Trophy size={18} />
          قائمة المتصدرين
        </Link>

        {/* Edit Button */}
        {isOwner && (
          <Link
            href="/profile/edit"
            className="
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#d4af37]
              py-3.5
              font-bold
              text-[#16284a]
              transition
              hover:brightness-105
              active:scale-[0.97]
            "
          >
            <Settings size={18} />
            تعديل الحساب
          </Link>
        )}
{isOwner && (
  <button
    type="button"
    onClick={handleLogout}
    className="
      mt-3
      flex
      w-full
      items-center
      justify-center
      gap-2
      rounded-full
      border
      border-red-400/20
      bg-red-400/5
      py-3.5
      font-bold
      text-red-300
      transition
      hover:bg-red-400/10
      active:scale-[0.97]
    "
  >
    <LogOut size={18} />
    تسجيل الخروج
  </button>
)}
      </div>
    </section>
  );
}