import { supabase } from "@/services/supabase/client";
import ProfilePostCard from "./ProfilePostCard";

type Props = { userId: string };

export default async function ProfilePosts({ userId }: Props) {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, user_id, content, image_url, created_at, profiles(full_name, avatar_url), likes(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const rows = posts ?? [];
  const postIds = rows.map((post) => post.id);

  const { data: { user } } = await supabase.auth.getUser();
  let likedPostIds = new Set<string>();

  if (user && postIds.length > 0) {
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    likedPostIds = new Set((likes ?? []).map((like) => like.post_id));
  }

  return (
    <section className="mx-auto w-full max-w-xl px-4 pb-12 pt-7">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#16284a]">المنشورات</h2>
        <p className="mt-1 text-sm text-[#16284a]/50">ما شاركه هذا العضو في لحظات لافازا</p>
      </div>

      {rows.length > 0 ? (
        <div className="space-y-4">
          {rows.map((post) => {
            const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
            const likes = Array.isArray(post.likes) ? post.likes[0]?.count ?? 0 : 0;

            return (
              <ProfilePostCard
                key={post.id}
                post={{
                  ...post,
                  profile,
                  likesCount: likes,
                  liked: likedPostIds.has(post.id),
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-[#16284a]/12 bg-white px-6 py-12 text-center">
          <p className="font-bold text-[#16284a]">لا توجد منشورات بعد</p>
          <p className="mt-2 text-sm text-[#16284a]/50">ستظهر اللحظات التي يشاركها العضو هنا.</p>
        </div>
      )}
    </section>
  );
}
