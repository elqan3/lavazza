"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Flame, LogOut, MessageSquare, Settings, Trophy } from "lucide-react";
import { supabase } from "@/services/supabase/client";

type Props = { userId: string };

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  login_streak: number;
};

export default function ProfileHeader({ userId }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const [
        { data: { user } },
        { data: profileData, error: profileError },
        { data: leaderboardData },
        { count },
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("id, full_name, username, avatar_url, bio, points, login_streak").eq("id", userId).single(),
        supabase.from("leaderboard").select("rank").eq("id", userId).maybeSingle(),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      ]);

      setCurrentUserId(user?.id ?? null);

      if (profileError || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setRank(leaderboardData?.rank ?? null);
      setPostCount(count ?? 0);
      setLoading(false);
    }

    loadProfile();
  }, [userId]);

  async function handleLogout() {
    setLogoutError("");
    if (!window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟")) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError("تعذر تسجيل الخروج. حاول مرة أخرى.");
      return;
    }

    window.location.href = "/login";
  }

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-xl px-4">
        <div className="animate-pulse rounded-[1.75rem] bg-white p-5 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-[#16284a]/8" />
          <div className="mx-auto mt-6 h-24 w-24 rounded-full bg-[#16284a]/8" />
          <div className="mx-auto mt-4 h-6 w-36 rounded-full bg-[#16284a]/8" />
          <div className="mx-auto mt-2 h-4 w-24 rounded-full bg-[#16284a]/8" />
          <div className="mt-6 h-20 rounded-2xl bg-[#16284a]/6" />
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="mx-auto w-full max-w-xl px-4">
        <div className="rounded-[1.75rem] bg-white p-10 text-center shadow-sm">
          <p className="font-bold">المستخدم غير موجود</p>
          <Link href="/mood-space" className="mt-5 inline-flex rounded-full bg-[#16284a] px-5 py-3 text-sm font-bold text-white">
            العودة إلى لحظات لافازا
          </Link>
        </div>
      </section>
    );
  }

  const isOwner = currentUserId === userId;

  return (
    <section className="mx-auto w-full max-w-xl px-4">
      <div className="rounded-[1.75rem] border border-[#16284a]/8 bg-white p-4 shadow-sm">
        <header className="flex items-center justify-between">
          <Link href="/mood-space" aria-label="العودة إلى لحظات لافازا" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#16284a]/10 bg-[#f6f3ed] text-[#16284a] transition active:scale-95">
            <ArrowLeft size={19} />
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b58b22]">Lavaza</p>
            <p className="text-sm font-bold">الملف الشخصي</p>
          </div>

          <Link href="/leaderboard" aria-label="قائمة المتصدرين" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#b58b22] transition active:scale-95">
            <Trophy size={18} />
          </Link>
        </header>

        <div className="mt-7 text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-[#f6f3ed] ring-1 ring-[#d4af37]/40">
            <Image src={profile.avatar_url || "/avatar.png"} alt="" width={96} height={96} className="h-full w-full object-cover" />
          </div>

          <h1 className="mt-4 text-xl font-black text-[#16284a]">{profile.full_name || "عضو Lavaza"}</h1>
          {profile.username && <p className="mt-1 text-sm text-[#b58b22]">@{profile.username}</p>}

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#16284a]/60">
            {profile.bio?.trim() || "عضو في مجتمع Lavaza Mood"}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-x-reverse divide-[#16284a]/8 overflow-hidden rounded-2xl border border-[#16284a]/8 bg-[#f6f3ed]">
          <div className="px-2 py-4 text-center">
            <p className="text-lg font-black text-[#16284a]">{postCount}</p>
            <p className="mt-1 text-[11px] text-[#16284a]/50">منشور</p>
          </div>
          <div className="px-2 py-4 text-center">
            <p className="text-lg font-black text-[#b58b22]">{profile.points}</p>
            <p className="mt-1 text-[11px] text-[#16284a]/50">نقطة</p>
          </div>
          <div className="px-2 py-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={16} className="text-orange-500" />
              <p className="text-lg font-black text-orange-500">{profile.login_streak}</p>
            </div>
            <p className="mt-1 text-[11px] text-[#16284a]/50">تتابع يومي</p>
          </div>
        </div>

        {rank && (
          <Link href="/leaderboard" className="mt-4 flex items-center justify-between rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/8 px-4 py-3 transition active:scale-[0.99]">
            <span className="text-sm font-semibold text-[#16284a]/65">ترتيبك في المجتمع</span>
            <span className="font-black text-[#b58b22]">#{rank}</span>
          </Link>
        )}

        {isOwner && (
          <div className="mt-5 space-y-2">
            <Link href="/profile/edit" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#16284a] px-5 text-sm font-bold text-white transition active:scale-[0.98]">
              <Settings size={17} />
              تعديل الحساب
            </Link>

            <Link href="/feedback" className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#16284a]/10 bg-[#f6f3ed] px-5 text-sm font-semibold text-[#16284a]/70 transition active:scale-[0.98]">
              <MessageSquare size={17} />
              شاركنا رأيك
            </Link>

            <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-red-900/10 bg-red-50 px-5 text-sm font-semibold text-red-700 transition active:scale-[0.98]">
              <LogOut size={17} />
              تسجيل الخروج
            </button>

            {logoutError && <p className="text-center text-xs text-red-700">{logoutError}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
