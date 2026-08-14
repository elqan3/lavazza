"use client";
import LikeButton from "./LikeButton";
import Image from "next/image";
import Link from "next/link";
type Props = {
  post: {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
};
export default function MoodPost({ post }: Props) {
  return (
  
      <article
className="
bg-white/5
backdrop-blur-sm
rounded-3xl
overflow-hidden
border
border-white/10
shadow-lg
"
>
      {/* Header */}

      <div className="
flex
items-center
gap-3
p-4
">

        <Link
  href={`/profile/${post.user_id}`}
  className="flex items-center gap-3 flex-1"
>

  <Image
    src={post.profiles?.avatar_url || "/avatar.png"}
    alt=""
    width={46}
    height={46}
    className="
      rounded-full
      object-cover
      border
      border-[#d4af37]
    "
  />

  <div>

    <h3 className="
font-bold
text-white
text-sm
">
      {post.profiles?.full_name || "Lavaza Member"}
    </h3>

    <p className="
text-[11px]
text-white/50
">
      {new Date(post.created_at).toLocaleDateString("ar-LY")}
    </p>

  </div>

</Link>

      </div>

      {/* Image */}

      {post.image_url && (

        <Image
          src={post.image_url}
          alt=""
          width={700}
          height={700}
          className="
w-full
aspect-square
object-cover
"
        />

      )}

      {/* Caption */}

      <div className="p-4">

        <p
          className="
          text-white
          leading-7
          text-sm
          "
        >
          {post.content}
        </p>

        {/* Footer */}

        <div className="
mt-5
pt-4
border-t
border-white/10
">
    <LikeButton postId={post.id} />
</div>

      </div>

    </article>
  );
}