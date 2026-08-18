"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export default function MoodHeader() {
  

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("PROFILE LOAD ERROR:", error);
        }

        setProfile(data);
      } catch (error) {
        console.error("HEADER USER ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  

  return (
    <header
      className="
        sticky
        top-0
        z-20
        bg-[#0a1326]/90
        backdrop-blur-md
        border-b
        border-white/5
        py-3
      "
    >
      <div
        className="
          max-w-xl
          mx-auto
          flex
          items-center
          justify-between
          gap-3
          px-4
        "
      >
        {/* Logo */}
        <Link
          href="/mood-space"
          className="shrink-0"
        >
          <Image
            src="/menu/logo.png"
            alt="Lavaza Mood"
            width={105}
            height={40}
            priority
            className="object-contain"
          />
        </Link>

        {/* Loading */}
        {loading ? (
          <div className="w-20 h-9 rounded-full bg-white/5 animate-pulse" />
        ) : !user ? (
          /* Guest */
          <Link
            href="/auth"
            className="
              shrink-0
              bg-[#d4af37]
              text-[#0b1428]
              px-5
              py-2.5
              rounded-full
              text-sm
              font-bold
              active:scale-95
              transition
            "
          >
            دخول
          </Link>
        ) : (
          /* Logged in */
          <div
            className="
              flex
              items-center
              gap-2
              min-w-0
            "
          >
            {/* Create Post */}
            <Link
              href="/create-post"
              className="
                shrink-0
                bg-[#d4af37]
                text-[#0b1428]
                px-3
                sm:px-4
                py-2
                rounded-full
                text-xs
                sm:text-sm
                font-bold
                active:scale-95
                transition
              "
            >
              + مشاركة
            </Link>

            {/* Profile */}
            <Link
              href={`/profile/${user.id}`}
              className="shrink-0"
            >
              <Image
                src={profile?.avatar_url || "/avatar.png"}
                alt={profile?.full_name || "صورة الحساب"}
                width={40}
                height={40}
                className="
                  rounded-full
                  object-cover
                  border-2
                  border-[#d4af37]
                  bg-[#16284a]
                "
              />
            </Link>

            
          </div>
        )}
      </div>
    </header>
  );
}