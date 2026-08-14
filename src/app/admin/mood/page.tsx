import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trash2, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/services/supabase/server";

export default async function AdminMoodPage() {
  const supabase = await createClient();

  // التحقق من المستخدم
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // التحقق من صلاحيات الأدمن
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/mood-space");
  }

  // جلب المنشورات
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      content,
      image_url,
      likes_count,
      created_at,
      profiles (
        full_name,
        username,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN MOOD ERROR:", error);
  }

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#0f1d36]
        px-4
        py-6
        text-white
      "
    >
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <header
          className="
            mb-6
            flex
            items-center
            justify-between
            rounded-3xl
            border
            border-white/10
            bg-[#16284a]
            p-4
            shadow-xl
          "
        >

          <Link
            href="/admin"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white/5
              transition
              active:scale-90
            "
          >
            <ArrowRight size={20} />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-bold">
              إدارة Mood Space
            </h1>

            <p className="mt-1 text-xs text-white/50">
              إدارة المنشورات والمحتوى
            </p>
          </div>

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#d4af37]/10
              text-[#d4af37]
            "
          >
            <MessageSquare size={20} />
          </div>

        </header>


        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#16284a]
              p-5
            "
          >
            <p className="text-xs text-white/50">
              إجمالي المنشورات
            </p>

            <p className="mt-2 text-3xl font-bold text-[#d4af37]">
              {posts?.length || 0}
            </p>
          </div>


          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#16284a]
              p-5
            "
          >
            <p className="text-xs text-white/50">
              الحالة
            </p>

            <p className="mt-2 text-lg font-bold text-green-400">
              نشط
            </p>
          </div>

        </div>


        {/* Posts */}
        <section className="space-y-5">

          {posts?.length === 0 && (
            <div
              className="
                rounded-3xl
                border
                border-white/10
                bg-[#16284a]
                p-10
                text-center
              "
            >
              <p className="text-white/50">
                لا توجد منشورات حاليًا
              </p>
            </div>
          )}


          {posts?.map((post) => {

            const profile = Array.isArray(post.profiles)
              ? post.profiles[0]
              : post.profiles;

            return (
              <article
                key={post.id}
                className="
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-[#16284a]
                  shadow-xl
                "
              >

                {/* User */}
                <div className="flex items-center gap-3 p-4">

                  <Image
                    src={
                      profile?.avatar_url ||
                      "/avatar.png"
                    }
                    alt=""
                    width={45}
                    height={45}
                    className="
                      h-[45px]
                      w-[45px]
                      rounded-full
                      border-2
                      border-[#d4af37]
                      object-cover
                    "
                  />

                  <div className="min-w-0 flex-1">

                    <p className="truncate font-bold">
                      {profile?.full_name ||
                        "Lavaza Member"}
                    </p>

                    {profile?.username && (
                      <p className="text-xs text-[#d4af37]">
                        @{profile.username}
                      </p>
                    )}

                  </div>

                  <p className="text-[11px] text-white/30">
                    {new Date(
                      post.created_at
                    ).toLocaleDateString("ar-LY")}
                  </p>

                </div>


                {/* Image */}
                {post.image_url && (
                  <div
                    className="
                      relative
                      aspect-square
                      w-full
                      overflow-hidden
                      bg-black/20
                      sm:aspect-video
                    "
                  >

                    <Image
                      src={post.image_url}
                      alt=""
                      fill
                      sizes="
                        (max-width: 640px) 100vw,
                        768px
                      "
                      className="object-cover"
                    />

                  </div>
                )}


                {/* Content */}
                <div className="p-4">

                  <p className="whitespace-pre-wrap text-sm leading-7 text-white/80">
                    {post.content}
                  </p>


                  {/* Meta */}
                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-xs text-white/40">
                      ❤️ {post.likes_count || 0} إعجاب
                    </span>

                    <span className="text-[10px] text-white/20">
                      ID: {post.id.slice(0, 8)}...
                    </span>

                  </div>


                  {/* Delete */}
                  <form
                    action={`/api/admin/posts/${post.id}/delete`}
                    method="POST"
                    className="mt-4"
                  >

                    <button
                      type="submit"
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        border
                        border-red-500/20
                        bg-red-500/10
                        py-3
                        font-bold
                        text-red-400
                        transition
                        active:scale-[0.98]
                      "
                    >

                      <Trash2 size={18} />

                      حذف المنشور

                    </button>

                  </form>

                </div>

              </article>
            );
          })}

        </section>

      </div>
    </main>
  );
}