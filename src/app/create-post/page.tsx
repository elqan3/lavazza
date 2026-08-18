"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Coffee,
  ArrowRight,
  X,
} from "lucide-react";

export default function CreatePost() {
  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleCancel() {
    if (loading) return;

    router.push("/mood-space");
  }

  async function publishPost() {
    if (loading) return;

    if (!image || !content.trim()) {
      alert("أضف صورة ووصف");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const fileName = `${user.id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("mood-images")
      .upload(fileName, image);

    if (uploadError) {
      console.error(uploadError);
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("mood-images")
      .getPublicUrl(fileName);

    const { error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        content: content.trim(),
      });

    if (postError) {
      console.error(postError);
      alert(postError.message);
      setLoading(false);
      return;
    }

    router.push("/mood-space");
  }

  return (
    <main
      dir="rtl"
      className="
        min-h-[100dvh]
        bg-[#0b1428]
        text-white
        px-4
        sm:px-5
        pt-5
        pb-32
      "
    >
      {/* Header */}
      <header
        className="
          max-w-md
          mx-auto
          flex
          items-center
          justify-between
          mb-6
        "
      >
        {/* Cancel / Back */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="
            w-11
            h-11
            rounded-full
            bg-white/10
            border
            border-white/10
            flex
            items-center
            justify-center
            text-white/80
            hover:bg-white/15
            transition
            active:scale-95
            disabled:opacity-40
          "
          aria-label="إلغاء"
        >
          <X size={21} />
        </button>

        <h1
          className="
            text-xl
            font-bold
            text-center
          "
        >
          شارك لحظتك ☕
        </h1>

        {/* Spacer to keep title centered */}
        <div className="w-11" />
      </header>

      {/* Content */}
      <div
        className="
          max-w-md
          mx-auto
          space-y-5
        "
      >
        {/* Image Picker */}
        <label className="block cursor-pointer">
          <div
            className="
              relative
              aspect-square
              w-full
              rounded-3xl
              overflow-hidden
              border
              border-white/10
              bg-[#16284a]
              flex
              items-center
              justify-center
              shadow-xl
            "
          >
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="معاينة الصورة"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />

                {/* Change image hint */}
                <div
                  className="
                    absolute
                    bottom-4
                    right-4
                    left-4
                    bg-black/50
                    backdrop-blur-md
                    rounded-2xl
                    px-4
                    py-3
                    text-center
                    text-sm
                    text-white/90
                  "
                >
                  اضغط لتغيير الصورة
                </div>
              </>
            ) : (
              <div className="text-center text-white/60 px-5">
                <ImagePlus
                  size={45}
                  className="
                    mx-auto
                    mb-3
                    text-[#d4af37]
                  "
                />

                <p className="font-medium">
                  أضف صورة اللحظة
                </p>

                <p className="text-xs text-white/40 mt-2">
                  اختر صورة من هاتفك
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </label>

        {/* Description */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="اكتب وصف اللحظة..."
          maxLength={500}
          className="
            w-full
            min-h-36
            rounded-3xl
            bg-white/10
            border
            border-white/10
            p-5
            text-white
            placeholder:text-white/40
            outline-none
            resize-none
            focus:border-[#d4af37]
            transition
          "
        />

        {/* Character Counter */}
        <div
          className="
            text-left
            text-xs
            text-white/35
            -mt-3
            px-2
          "
        >
          {content.length}/500
        </div>

        {/* Publish Button */}
        <button
          type="button"
          onClick={publishPost}
          disabled={loading}
          className="
            w-full
            min-h-[58px]
            py-4
            px-6
            rounded-full
            bg-[#d4af37]
            text-[#16284a]
            font-bold
            text-lg
            flex
            items-center
            justify-center
            gap-2
            active:scale-[0.98]
            transition
            shadow-lg
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <Coffee size={22} />

          {loading ? "جاري النشر..." : "نشر اللحظة"}
        </button>

        {/* Cancel text for mobile */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="
            w-full
            py-3
            text-sm
            text-white/50
            hover:text-white/80
            transition
            disabled:opacity-40
          "
        >
          إلغاء والعودة إلى Mood Space
        </button>
      </div>
    </main>
  );
}