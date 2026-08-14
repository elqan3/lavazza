"use client";

import Image from "next/image";
import DeletePostButton from "./DeletePostButton";
import { useAuth } from "@/features/auth/components/AuthProvider";

type Props = {
  post: any;
};

export default function ProfilePostCard({ post }: Props) {
  const { user } = useAuth();

  const isOwner = user?.id === post.user_id;

  return (
    <article
      className="
        overflow-hidden
        rounded-3xl
        bg-[#16284a]
        border
        border-white/10
        shadow-xl
      "
    >

      {/* صورة المنشور */}
      {post.image_url && (
        <Image
          src={post.image_url}
          alt="Lavaza Mood"
          width={700}
          height={700}
          className="
            w-full
            aspect-square
            object-cover
          "
        />
      )}


      {/* المحتوى */}
      <div className="p-5">

        <p
          className="
            text-white
            leading-8
            text-sm
          "
        >
          {post.content}
        </p>


        <div
          className="
            mt-5
            flex
            items-center
            justify-between
          "
        >

          <p className="text-xs text-white/40">
            {new Date(post.created_at)
              .toLocaleDateString("ar-LY")}
          </p>


          {isOwner && (
  <DeletePostButton
    postId={post.id}
    imageUrl={post.image_url}
  />
)}

        </div>

      </div>

    </article>
  );
}