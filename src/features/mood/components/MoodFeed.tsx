import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera, Heart, Plus } from "lucide-react";

import { createClient } from "@/services/supabase/server";
import MoodPost from "./MoodPost";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
};

type MoodPostRow = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: Profile | Profile[] | null;
  likes: { count: number }[] | null;
};

function getProfile(profile: MoodPostRow["profiles"]) {
  return Array.isArray(profile) ? profile[0] ?? null : profile;
}

function getLikesCount(likes: MoodPostRow["likes"]) {
  return likes?.[0]?.count ?? 0;
}

export default async function MoodFeed() {
  const supabase = await createClient();

  const [
    { data: { user } },
    { data: posts, error },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        content,
        image_url,
        created_at,
        profiles(full_name, avatar_url),
        likes(count)
        `
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (error) {
    console.error("MOOD FEED ERROR:", error);
  }

  const rows = (posts ?? []) as MoodPostRow[];
  const postIds = rows.map((post) => post.id);

  let profile: { avatar_url: string | null } | null = null;
  let likedPostIds = new Set<string>();

  if (user) {
    const [{ data: profileData }, { data: userLikes }] = await Promise.all([
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      postIds.length > 0
        ? supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

    profile = profileData;
    likedPostIds = new Set((userLikes ?? []).map((like) => like.post_id));
  }

  /*
  if (user && postIds.length > 0) {
    const { data: userLikes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    likedPostIds = new Set((userLikes ?? []).map((like) => like.post_id));
  }
  */

  return (
    <main
      dir="rtl"
      className="min-h-[100dvh] bg-[#f6f3ed] pb-28 text-[#16284a]"
    >
      <header className="sticky top-0 z-20 border-b border-[#16284a]/8 bg-[#f6f3ed]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-4">
          <Link href="/home" aria-label="العودة للرئيسية" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#16284a]/10 bg-white text-[#16284a] transition active:scale-95">
            <ArrowLeft size={19} />
          </Link>

          <Link href="/mood-space" className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b58b22]">
              Lavaza
            </p>
            <h1 className="text-base font-bold">لحظات لافازا</h1>
          </Link>

          {user ? (
            <Link
              href={`/profile/${user.id}`}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#b58b22]/40 bg-white"
            >
              <Image
                src={profile?.avatar_url || "/avatar.png"}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            </Link>
          ) : (
            <Link href="/auth" className="rounded-full bg-[#16284a] px-4 py-2 text-xs font-bold text-white">
              دخول
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-xl px-4 pt-6">
        <section className="rounded-[1.75rem] bg-[#16284a] px-5 py-6 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#d4af37]">مساحتك</p>
              <h2 className="mt-2 text-2xl font-bold">شارك لحظتك</h2>
              <p className="mt-2 max-w-[270px] text-sm leading-6 text-white/65">
                صورة، قهوة، أو لحظة بسيطة من يومك مع مجتمع Lavaza.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#d4af37]">
              <Camera size={22} />
            </div>
          </div>

          <Link
            href={user ? "/create-post" : "/auth"}
            className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4af37] px-5 text-sm font-bold text-[#16284a] transition active:scale-[0.98]"
          >
            <Plus size={18} />
            {user ? "شارك لحظتك" : "سجّل دخولك للمشاركة"}
          </Link>
        </section>

        <div className="mb-5 mt-8">
          <h2 className="text-lg font-bold">آخر اللحظات</h2>
          <p className="mt-1 text-sm text-[#16284a]/55">
            لحظات حقيقية من مجتمع Lavaza
          </p>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-900/10 bg-white px-5 py-12 text-center">
            <p className="text-sm text-red-700">تعذر تحميل اللحظات حالياً.</p>
          </div>
        ) : rows.length > 0 ? (
          <section className="space-y-5">
            {rows.map((post) => {
              const profile = getProfile(post.profiles);

              return (
                <MoodPost
                  key={post.id}
                  post={{
                    id: post.id,
                    user_id: post.user_id,
                    content: post.content,
                    image_url: post.image_url,
                    created_at: post.created_at,
                    profile,
                    likesCount: getLikesCount(post.likes),
                    liked: likedPostIds.has(post.id),
                  }}
                />
              );
            })}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-[#16284a]/12 bg-white px-6 py-14 text-center">
            <Heart className="mx-auto text-[#b58b22]/60" size={38} />
            <h3 className="mt-4 font-bold">المساحة هادئة الآن</h3>
            <p className="mt-2 text-sm leading-6 text-[#16284a]/55">
              كن أول من يشارك لحظته في Lavaza.
            </p>
            {user && (
              <Link
                href="/create-post"
                className="mt-6 inline-flex rounded-full bg-[#16284a] px-5 py-3 text-sm font-bold text-white"
              >
                ابدأ المشاركة
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

