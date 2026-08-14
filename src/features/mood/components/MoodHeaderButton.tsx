"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/components/AuthProvider";

export default function MoodHeaderButton() {

  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Link
      href={user ? "/create-post" : "/auth"}
      className="
      inline-block
      mt-8
      bg-[#d4af37]
      text-black
      px-8
      py-4
      rounded-full
      font-bold
      transition
      hover:scale-105
      "
    >
      {user ? " شارك لحظتك" : " أنشئ حسابًا وشارك لحظتك"}
    </Link>
  );
}