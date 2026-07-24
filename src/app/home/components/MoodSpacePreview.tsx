import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import FadeIn from "./FadeIn";

type MoodPost = {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profiles:
    | {
        full_name: string | null;
        avatar_url: string | null;
      }
    | {
        full_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

function getProfile(post: MoodPost) {
  if (Array.isArray(post.profiles)) {
    return post.profiles[0] ?? null;
  }

  return post.profiles;
}

export default async function MoodSpacePreview() {
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      image_url,
      created_at,
      profiles(full_name, avatar_url)
    `
    )
    .order("created_at", { ascending: false })
    .limit(3);

  const previewPosts = (posts ?? []) as MoodPost[];

  return (
    <section className="bg-white px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-12 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-right">
          <div>
            <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.3em] text-lavaza-gold">
              Mood Space
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">مساحة لافازا</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-lavaza-primary/65 sm:text-base">
              آخر اللحظات المشاركة من مجتمع لافازا مود
            </p>
          </div>

          <Link
            href="/mood-space"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-lavaza-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-lavaza-primary/90 active:scale-[0.98]"
          >
            الدخول إلى مساحة لافازا
            <ArrowLeft size={16} />
          </Link>
        </FadeIn>

        {previewPosts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {previewPosts.map((post, index) => {
              const profile = getProfile(post);

              return (
              <FadeIn key={post.id} delay={index * 0.08}>
                <article className="overflow-hidden rounded-3xl border border-lavaza-primary/8 bg-lavaza-cream shadow-sm transition hover:shadow-md">
                  {post.image_url ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={post.image_url}
                        alt=""
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-lavaza-primary/5">
                      <Heart className="text-lavaza-gold/40" size={40} />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <Image
                        src={profile?.avatar_url || "/logo.png"}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full border border-lavaza-gold/30 object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold">
                          {profile?.full_name || "Lavaza Member"}
                        </p>
                        <p className="text-xs text-lavaza-primary/50">
                          {new Date(post.created_at).toLocaleDateString("ar-LY")}
                        </p>
                      </div>
                    </div>

                    {post.content && (
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-lavaza-primary/70">
                        {post.content}
                      </p>
                    )}
                  </div>
                </article>
              </FadeIn>
            );
            })}
          </div>
        ) : (
          <FadeIn>
            <div className="rounded-3xl border border-dashed border-lavaza-primary/15 bg-lavaza-cream px-6 py-16 text-center">
              <Heart className="mx-auto text-lavaza-gold/50" size={40} />
              <p className="mt-4 text-lavaza-primary/60">
                لا توجد منشورات بعد — كن أول من يشارك لحظته
              </p>
              <Link
                href="/mood-space"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lavaza-gold"
              >
                زيارة مساحة لافازا
                <ArrowLeft size={16} />
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
