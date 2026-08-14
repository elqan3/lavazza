"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Camera, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase/client";

export default function EditProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      alert("تعذر تحميل بيانات الحساب");
      router.back();
      return;
    }

    setName(data.full_name || "");
    setUsername(data.username || "");
    setPhone(data.phone || "");
    setBio(data.bio || "");
    setAvatar(data.avatar_url || "");

    setLoading(false);
  }

  function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("اختر صورة صالحة");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }

    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function saveProfile() {
    if (!name.trim()) {
      alert("اكتب اسمك");
      return;
    }

    if (!username.trim()) {
      alert("اكتب اسم المستخدم");
      return;
    }

    setSaving(true);

    let avatarUrl = avatar;

    if (avatarFile) {
      const filePath = `${userId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
        });

      if (uploadError) {
        alert(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", userId);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/profile/${userId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d1b33] px-4 py-8 text-white">
        <div className="mx-auto max-w-xl animate-pulse">
          <div className="h-8 w-32 rounded-full bg-white/10" />
          <div className="mt-8 h-[600px] rounded-[2rem] bg-[#16284a]" />
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0d1b33] px-4 py-8 text-white"
    >
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <button
            onClick={() => router.back()}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-white/10
              transition
              active:scale-90
            "
          >
            <ArrowRight size={20} />
          </button>

          <h1 className="text-xl font-bold">
            تعديل الحساب
          </h1>

          <div className="w-10" />
        </div>

        {/* Card */}
        <div
          className="
            rounded-[2rem]
            border border-white/10
            bg-[#16284a]
            p-6
            shadow-2xl
          "
        >

          {/* Avatar */}
          <div className="flex justify-center">

            <label className="relative block cursor-pointer">

              <Image
                src={
                  preview ||
                  avatar ||
                  "/avatar.png"
                }
                alt="صورة الحساب"
                width={120}
                height={120}
                className="
                  h-[120px]
                  w-[120px]
                  rounded-full
                  border-4
                  border-[#d4af37]
                  object-cover
                "
              />

              <div
                className="
                  absolute
                  bottom-1
                  right-1
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border-4
                  border-[#16284a]
                  bg-[#d4af37]
                  text-[#16284a]
                "
              >
                <Camera size={18} />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

            </label>
          </div>

          <p className="mt-4 text-center text-xs text-white/40">
            اضغط على الصورة لتغييرها
          </p>

          {/* Name */}
          <div className="mt-8">

            <label className="mb-2 block text-sm font-semibold">
              الاسم
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك"
              className="
                w-full
                rounded-2xl
                border border-white/10
                bg-white/5
                px-4
                py-4
                outline-none
                transition
                focus:border-[#d4af37]
              "
            />

          </div>

          {/* Username */}
          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold">
              اسم المستخدم
            </label>

            <div className="relative">

              <span
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#d4af37]
                "
              >
                @
              </span>

              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.replace(/\s/g, "")
                  )
                }
                placeholder="username"
                dir="ltr"
                className="
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-12
                  py-4
                  text-left
                  outline-none
                  transition
                  focus:border-[#d4af37]
                "
              />

            </div>

          </div>

          {/* Bio */}
          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold">
              النبذة
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب شيئًا عنك..."
              maxLength={160}
              className="
                h-28
                w-full
                resize-none
                rounded-2xl
                border border-white/10
                bg-white/5
                px-4
                py-4
                leading-7
                outline-none
                transition
                focus:border-[#d4af37]
              "
            />

            <p className="mt-1 text-xs text-white/30">
              {bio.length}/160
            </p>

          </div>

          {/* Phone */}
          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold">
              رقم الهاتف
            </label>

            <input
              value={phone}
              disabled
              dir="ltr"
              className="
                w-full
                cursor-not-allowed
                rounded-2xl
                border border-white/5
                bg-black/10
                px-4
                py-4
                text-white/40
                outline-none
              "
            />

            <p className="mt-2 text-xs text-white/30">
              لا يمكن تغيير رقم الهاتف من هنا
            </p>

          </div>

          {/* Save */}
          <button
            onClick={saveProfile}
            disabled={saving}
            className="
              mt-8
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#d4af37]
              py-4
              font-bold
              text-[#16284a]
              transition
              active:scale-[0.98]
              disabled:opacity-50
            "
          >

            {saving ? (
              <>
                <Loader2
                  size={19}
                  className="animate-spin"
                />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={19} />
                حفظ التغييرات
              </>
            )}

          </button>

        </div>
      </div>
    </main>
  );
}