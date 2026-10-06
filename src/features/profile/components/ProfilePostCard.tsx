"use client";

import Image from "next/image";
import Link from "next/link";
import DeletePostButton from "./DeletePostButton";
import LikeButton from "@/features/mood/components/LikeButton";
import { useAuth } from "@/features/auth/components/AuthProvider";

type Props = {
  post: {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    profile?: { full_name: string | null; avatar_url: string | null } | null;
    likesCount: number;
    liked: boolean;
  };
};

export default function ProfilePostCard({ post }: Props) {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-[#16284a]/8 bg-white shadow-sm">
      <Link href={`/profile/${post.user_id}`} className="flex items-center gap-3 px-4 py-4">
        <Image src={post.profile?.avatar_url || "/avatar.png"} alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-[#b58b22]/30 object-cover" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#16284a]">{post.profile?.full_name || "عضو Lavaza"}</p>
          <p className="mt-0.5 text-[11px] text-[#16284a]/45">
            {new Date(post.created_at).toLocaleDateString("ar-LY", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </Link>

      {post.image_url && (
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f1eee7]">
          <Image src={post.image_url} alt="" fill sizes="(max-width: 640px) 100vw, 576px" className="object-cover" />
        </div>
      )}

      <div className="px-4 pb-4 pt-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-[#16284a]/85">{post.content}</p>

        <div className="mt-4 flex items-center justify-between border-t border-[#16284a]/8 pt-3">
          <LikeButton postId={post.id} initialCount={post.likesCount} initialLiked={post.liked} />
          {isOwner && <DeletePostButton postId={post.id} imageUrl={post.image_url} />}
        </div>
      </div>
    </article>
  );
}
