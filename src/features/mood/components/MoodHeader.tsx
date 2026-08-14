"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";

export default function MoodHeader() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    }

    loadUser();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  return (
    <header
      className="
      sticky
      top-0
      z-20
      bg-[#0a1326]/90
      backdrop-blur-md
      py-4
      "
    >
      <div
        className="
        max-w-xl
        mx-auto
        flex
        items-center
        justify-between
        px-4
        "
      >

        {/* Logo */}
        <Link href="/mood-space">
          <Image
            src="/menu/logo.png"
            alt="Lavaza Mood"
            width={105}
            height={40}
            priority
            className="object-contain"
          />
        </Link>


        {!user ? (

          <Link
            href="/auth"
            className="
            bg-[#d4af37]
            text-black
            px-5
            py-2
            rounded-full
            text-sm
            font-bold
            "
          >
            دخول
          </Link>

        ) : (

          <div
            className="
            flex
            items-center
            gap-3
            "
          >

            <Link
              href="/create-post"
              className="
              bg-[#d4af37]
              text-black
              px-4
              py-2
              rounded-full
              text-xs
              font-bold
              "
            >
              + مشاركة
            </Link>


            <Link href="/me">
              <Image
                src={profile?.avatar_url || "/avatar.png"}
                alt="avatar"
                width={38}
                height={38}
                className="
                rounded-full
                object-cover
                border
                border-[#d4af37]
                "
              />
            </Link>


            <button
              onClick={logout}
              className="
              text-xs
              text-red-300
              "
            >
              خروج
            </button>

          </div>

        )}

      </div>
    </header>
  );
}