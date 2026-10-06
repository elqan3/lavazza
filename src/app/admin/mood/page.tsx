import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trash2, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";

type Profile = { full_name: string | null; username: string | null; avatar_url: string | null };
type PostRow = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: Profile | Profile[] | null;
  likes: { count: number }[] | null;
};

function getProfile(profile: PostRow["profiles"]) {
  return Array.isArray(profile) ? profile[0] ?? null : profile;
}
function getLikesCount(likes: PostRow["likes"]) {
  return likes?.[0]?.count ?? 0;
}

export default async function AdminMoodPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/mood-space");

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      content,
      image_url,
      created_at,
      profiles(full_name, username, avatar_url),
      likes(count)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) console.error("ADMIN MOOD ERROR:", error);
  const posts = (data ?? []) as PostRow[];

  return (
    <main dir="rtl" className="min-h-screen bg-[#f6f3ed] px-4 py-6 text-[#16284a]">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-[#16284a]/8 bg-white p-4 shadow-sm">
          <Link href="/admin" aria-label="العودة" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16284a]/5 transition active:scale-90">
            <ArrowRight size={20} />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold">إدارة لحظات لافازا</h1>
            <p className="mt-1 text-xs text-[#16284a]/50">مراجعة وحذف المحتوى</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#b58b22]">
            <MessageSquare size={20} />
          </div>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-[#16284a]/8 bg-white p-5">
            <p className="text-xs text-[#16284a]/50">المنشورات المعروضة</p>
            <p className="mt-2 text-3xl font-bold text-[#b58b22]">{posts.length}</p>
          </div>
          <div className="rounded-3xl border border-[#16284a]/8 bg-white p-5">
            <p className="text-xs text-[#16284a]/50">الحالة</p>
            <p className="mt-2 text-lg font-bold text-emerald-600">نشط</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#16284a]/12 bg-white p-12 text-center text-[#16284a]/50">لا توجد منشورات حالياً.</div>
        ) : (
          <section className="space-y-5">
            {posts.map((post) => {
              const profile = getProfile(post.profiles);
              return (
                <article key={post.id} className="overflow-hidden rounded-[1.75rem] border border-[#16284a]/8 bg-white shadow-sm">
                  <div className="flex items-center gap-3 p-4">
                    <Image src={profile?.avatar_url || "/avatar.png"} alt="" width={45} height={45} className="h-[45px] w-[45px] rounded-full border border-[#b58b22]/30 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{profile?.full_name || "عضو Lavaza"}</p>
                      {profile?.username && <p className="text-xs text-[#b58b22]">@{profile.username}</p>}
                    </div>
                    <p className="text-[11px] text-[#16284a]/35">{new Date(post.created_at).toLocaleDateString("ar-LY")}</p>
                  </div>

                  {post.image_url && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f1eee7] sm:aspect-video">
                      <Image src={post.image_url} alt="" fill sizes="(max-width: 640px) 100vw, 900px" className="object-cover" />
                    </div>
                  )}

                  <div className="p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-[#16284a]/80">{post.content}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#16284a]/8 pt-3">
                      <span className="text-xs text-[#16284a]/45">{getLikesCount(post.likes)} إعجاب</span>
                      <span className="text-xs text-[#16284a]/30">{post.id.slice(0, 8)}</span>
                    </div>
                    <form action={`/api/admin/posts/${post.id}/delete`} method="POST" className="mt-4">
                      <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full border border-red-600/15 bg-red-600/5 py-3 font-bold text-red-700 transition active:scale-[0.98]">
                        <Trash2 size={18} />
                        حذف المنشور
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
