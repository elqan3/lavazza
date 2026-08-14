import { supabase } from "@/services/supabase/client";
import ProfilePostCard from "./ProfilePostCard";

type Props = {
  userId: string;
};

export default async function ProfilePosts({ userId }: Props) {

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles(
        full_name,
        avatar_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });


  return (
    <section className="px-5 pb-10">

      <div className="max-w-md mx-auto">

        <h2 className="
          text-xl
          font-bold
          text-white
          mb-5
        ">
          المنشورات
        </h2>


        {posts && posts.length > 0 ? (

          <div className="space-y-5">

            {posts.map((post)=>(
              <ProfilePostCard
                key={post.id}
                post={post}
              />
            ))}

          </div>

        ) : (

          <div className="
            text-center
            py-10
            rounded-3xl
            bg-[#16284a]
            text-white/50
          ">
            لا توجد منشورات بعد ☕
          </div>

        )}

      </div>

    </section>
  );
}