"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Coffee, ImagePlus, X } from "lucide-react";

import { supabase } from "@/services/supabase/client";

export default function CreatePost() {
  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("اختر ملف صورة صالحًا.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 6MB.");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleCancel() {
    if (!loading) router.push("/mood-space");
  }

  async function publishPost() {
    if (loading) return;

    const trimmed = content.trim();

    if (!trimmed) {
      setError("اكتب شيئًا قبل النشر.");
      return;
    }

    if (trimmed.length > 500) {
      setError("الحد الأقصى 500 حرف.");
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    let imageUrl: string | null = null;
    let uploadedFileName: string | null = null;

    if (image) {
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
      uploadedFileName = `${user.id}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("mood-images")
        .upload(uploadedFileName, image, {
          contentType: image.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("MOOD IMAGE UPLOAD ERROR:", uploadError);
        setError("تعذر رفع الصورة. حاول مرة أخرى.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("mood-images")
        .getPublicUrl(uploadedFileName);

      imageUrl = urlData.publicUrl;
    }

    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id,
      image_url: imageUrl,
      content: trimmed,
    });

    if (postError) {
      console.error("MOOD POST ERROR:", postError);

      if (uploadedFileName) {
        await supabase.storage.from("mood-images").remove([uploadedFileName]);
      }

      setError("تعذر نشر اللحظة. حاول مرة أخرى.");
      setLoading(false);
      return;
    }

    router.replace("/mood-space");
    router.refresh();
  }

  return (
    <main
      dir="rtl"
      className="min-h-[100dvh] bg-[#f6f3ed] px-4 pb-10 pt-5 text-[#16284a]"
    >
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-7 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            aria-label="العودة"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#16284a]/10 bg-white transition active:scale-95 disabled:opacity-40"
          >
            <ArrowRight size={20} />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b58b22]">
              Lavaza
            </p>
            <h1 className="mt-1 text-xl font-bold">شارك لحظتك</h1>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            aria-label="إلغاء"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#16284a]/45 transition hover:bg-white active:scale-95"
          >
            <X size={20} />
          </button>
        </header>

        <section className="rounded-[1.75rem] border border-[#16284a]/8 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16284a] text-[#d4af37]">
              <Coffee size={19} />
            </div>
            <div>
              <h2 className="font-bold">لحظة بسيطة تكفي</h2>
              <p className="text-xs text-[#16284a]/50">الصورة اختيارية</p>
            </div>
          </div>

          <label className="block cursor-pointer">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-dashed border-[#16284a]/12 bg-[#f6f3ed]">
              {preview ? (
                <>
                  <img src={preview} alt="معاينة" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-2 text-xs font-medium text-white">
                    تغيير الصورة
                  </span>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <ImagePlus className="text-[#b58b22]" size={38} />
                  <p className="mt-3 text-sm font-semibold">أضف صورة إن أردت</p>
                  <p className="mt-1 text-xs text-[#16284a]/45">JPG أو PNG حتى 6MB</p>
                </div>
              )}
            </div>

            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>

          <div className="mt-5">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError("");
              }}
              placeholder="ما الذي تريد مشاركته؟"
              maxLength={500}
              autoFocus
              className="min-h-36 w-full resize-none rounded-2xl border border-[#16284a]/10 bg-[#f6f3ed] p-4 text-sm leading-7 outline-none transition placeholder:text-[#16284a]/35 focus:border-[#b58b22]"
            />
            <div className="mt-2 flex items-center justify-between px-1 text-xs text-[#16284a]/40">
              <span>{error || "شارك شيئًا حقيقيًا من يومك."}</span>
              <span>{content.length}/500</span>
            </div>
          </div>

          <button
            type="button"
            onClick={publishPost}
            disabled={loading || !content.trim()}
            className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#16284a] px-6 text-sm font-bold text-white transition hover:bg-[#20365f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Coffee size={19} />
            {loading ? "جاري النشر..." : "نشر اللحظة"}
          </button>
        </section>
      </div>
    </main>
  );
}
