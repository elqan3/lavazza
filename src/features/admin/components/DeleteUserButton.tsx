"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

type Props = {
  userId: string;
  userName: string;
};

export default function DeleteUserButton({
  userId,
  userName,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف حساب "${userName}"؟\n\nسيتم حذف الحساب والمنشورات والإعجابات المرتبطة به نهائياً.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const response = await fetch(
      `/api/admin/users/${userId}/delete`,
      {
        method: "POST",
      }
    );

    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    if (!response.ok) {
      alert("حدث خطأ أثناء حذف الحساب.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="
        flex
        items-center
        justify-center
        gap-2
        rounded-full
        bg-red-500/10
        px-5
        py-3
        text-sm
        font-bold
        text-red-400
        transition
        hover:bg-red-500/20
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {loading ? (
        <>
          <Loader2
            size={16}
            className="animate-spin"
          />

          جاري الحذف...
        </>
      ) : (
        <>
          <Trash2 size={16} />

          حذف الحساب
        </>
      )}
    </button>
  );
}