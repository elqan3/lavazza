"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/services/supabase/client";

type Props = {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
};

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
}: Props) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (loading) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    setLoading(true);
    const nextLiked = !liked;

    setLiked(nextLiked);
    setCount((value) => Math.max(0, value + (nextLiked ? 1 : -1)));

    const result = nextLiked
      ? await supabase.from("likes").insert({
          post_id: postId,
          user_id: user.id,
        })
      : await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

    if (result.error) {
      setLiked(!nextLiked);
      setCount((value) => Math.max(0, value + (nextLiked ? -1 : 1)));

      if (result.error.code !== "23505") {
        console.error("LIKE ERROR:", result.error);
      }
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={loading}
      aria-label={liked ? "إزالة الإعجاب" : "إعجاب"}
      aria-pressed={liked}
      className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-[#16284a]/65 transition hover:bg-[#16284a]/5 active:scale-95 disabled:opacity-50"
    >
      <Heart
        size={20}
        strokeWidth={1.8}
        className={liked ? "fill-[#d4af37] text-[#b58b22]" : "text-[#16284a]/55"}
      />
      <span>{count}</span>
    </button>
  );
}
