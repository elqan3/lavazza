"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  postId: string;
};

export default function LikeButton({ postId }: Props) {
  const router = useRouter();

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadLikes();
  }, []);

  async function loadLikes() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { count } = await supabase
      .from("likes")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("post_id", postId);

    setLikes(count || 0);

    if (!user) return;

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    setLiked(!!data);
  }

  async function toggleLike() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      setLiked(false);
      setLikes((v) => Math.max(0, v - 1));
    } else {
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: user.id,
      });

      setLiked(true);
      setLikes((v) => v + 1);
    }
  }

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-2 transition active:scale-95"
    >
      <Heart
        size={22}
        fill={liked ? "#d4af37" : "transparent"}
        color={liked ? "#d4af37" : "#ffffff"}
      />

      <span className="text-white">
        {likes}
      </span>
    </button>
  );
}