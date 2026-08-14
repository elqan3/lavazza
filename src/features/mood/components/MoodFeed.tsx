import { supabase } from "@/services/supabase/client";

import MoodHeader from "./MoodHeader";
import MoodHeaderButton from "./MoodHeaderButton";
import MoodPost from "./MoodPost";

export default async function MoodFeed() {
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles(
        full_name,
        avatar_url
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  return (
  <main
    className="
    min-h-screen
    bg-[#0a1326]
    pb-24
    "
  >

    <div className="
      max-w-xl
      mx-auto
      px-3
    ">

      <MoodHeader />

      <div
        className="
        mt-6
        mb-4
        "
      >
        <h1
          className="
          text-white
          text-xl
          font-bold
          "
        >
          Mood Space ☕
        </h1>

        <p
          className="
          text-white/50
          text-sm
          mt-1
          "
        >
          شارك لحظتك مع مجتمع Lavaza
        </p>

      </div>


      <section className="space-y-5">

        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <MoodPost
              key={post.id}
              post={post}
            />
          ))
        ) : (
          <div className="
            text-center
            text-white/60
            py-20
          ">
            لا توجد لحظات بعد...
            <br />
            كن أول من يشارك ☕
          </div>
        )}

      </section>

    </div>


    <MoodHeaderButton />


  </main>
);
}