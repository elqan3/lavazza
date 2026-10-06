"use client";

import Link from "next/link";
import {
  Home,
  PlusSquare,
  User,
  Trophy,
  Coffee,
  Heart,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  if (
    pathname.startsWith("/order") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/auth"
  ) {
    return null;
  }

  const isMood = pathname.startsWith("/mood-space");
  const isLeaderboard = pathname.startsWith("/leaderboard");
  const isProfile = pathname.startsWith("/profile");
  const isHome = pathname === "/home";
  const isMenu = pathname.startsWith("/menu");

  const shellClass = isMood
    ? "border-[#16284a]/10 bg-[#f6f3ed]/95 text-[#16284a]"
    : "border-white/10 bg-[#0a1326]/95 text-white";

  return (
    <nav
      dir="rtl"
      className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl ${shellClass}`}
    >
      <div className="mx-auto flex h-20 max-w-xl items-center justify-around px-2">
        <Link
          href="/home"
          className={`flex min-w-[55px] flex-col items-center gap-1 text-[10px] transition ${isHome ? "text-[#d4af37]" : isMood ? "text-[#16284a]/55 hover:text-[#16284a]" : "text-white/60 hover:text-white"}`}
        >
          <Home size={21} />
          <span>الرئيسية</span>
        </Link>

        <Link
          href="/menu"
          className={`flex min-w-[55px] flex-col items-center gap-1 text-[10px] transition ${isMenu ? "text-[#d4af37]" : isMood ? "text-[#16284a]/55 hover:text-[#16284a]" : "text-white/60 hover:text-white"}`}
        >
          <Coffee size={21} />
          <span>المنيو</span>
        </Link>

        <Link
          href="/create-post"
          aria-label="مشاركة لحظة"
          className={`-mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-2xl transition active:scale-90 ${isMood ? "border-[#f6f3ed] bg-[#d4af37]" : "border-[#0a1326] bg-[#d4af37]"}`}
        >
          {isMood ? (
            <Heart size={27} className="text-[#16284a]" />
          ) : (
            <PlusSquare size={27} className="text-[#16284a]" />
          )}
        </Link>

        <Link
          href="/leaderboard"
          className={`flex min-w-[55px] flex-col items-center gap-1 text-[10px] transition ${isLeaderboard ? "text-[#d4af37]" : isMood ? "text-[#16284a]/55 hover:text-[#16284a]" : "text-white/60 hover:text-white"}`}
        >
          <Trophy size={21} />
          <span>المتصدرون</span>
        </Link>

        <Link
          href={`/profile/${user.id}`}
          className={`flex min-w-[55px] flex-col items-center gap-1 text-[10px] transition ${isProfile ? "text-[#d4af37]" : isMood ? "text-[#16284a]/55 hover:text-[#16284a]" : "text-white/60 hover:text-white"}`}
        >
          <User size={21} />
          <span>حسابي</span>
        </Link>
      </div>
    </nav>
  );
}
