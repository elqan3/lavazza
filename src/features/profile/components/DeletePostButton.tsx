"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/services/supabase/client";

type Props = {
  postId: string;
  imageUrl?: string | null;
};

export default function DeletePostButton({ postId, imageUrl }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deletePost() {
    if (loading) return;

    const confirmed = window.confirm("هل تريد حذف هذا المنشور؟");
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const { error: postError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (postError) {
      console.error("DELETE POST ERROR:", postError);
      setError("تعذر حذف المنشور.");
      setLoading(false);
      return;
    }

    if (imageUrl) {
      const fileName = imageUrl.split("/mood-images/").pop();

      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("mood-images")
          .remove([decodeURIComponent(fileName)]);

        if (storageError) {
          console.warn("DELETE MOOD IMAGE ERROR:", storageError);
        }
      }
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={deletePost}
        disabled={loading}
        className="flex items-center gap-2 text-xs font-semibold text-red-400 transition disabled:opacity-50"
      >
        <Trash2 size={16} />
        {loading ? "جاري الحذف..." : "حذف"}
      </button>

      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}
