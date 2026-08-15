"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase/client";

const PHONE_REGEX = /^(091|092|093|094|095)\d{7}$/;

const BANNED_NAMES = [
  "admin",
  "administrator",
  "test",
  "user",
  "unknown",
  "مجهول",
  "ادمن",
  "مشرف",
  "مدير",
];

function validateName(name: string) {
  const cleanName = name.trim();

  if (!cleanName) {
    return "أدخل اسمك الكامل";
  }

  if (Array.from(cleanName).length > 15) {
    return "الاسم يجب ألا يتجاوز 15 حرفًا";
  }

  const normalizedName = cleanName
    .toLowerCase()
    .replace(/\s+/g, " ");

  const isBanned = BANNED_NAMES.some(
    (banned) =>
      normalizedName === banned.toLowerCase() ||
      normalizedName.includes(banned.toLowerCase())
  );

  if (isBanned) {
    return "هذا الاسم غير مسموح باستخدامه";
  }

  return null;
}

function validatePhone(phone: string) {
  if (!/^\d+$/.test(phone)) {
    return "رقم الهاتف يجب أن يحتوي على أرقام فقط";
  }

  if (phone.length !== 10) {
    return "رقم الهاتف يجب أن يتكون من 10 أرقام";
  }

  if (!PHONE_REGEX.test(phone)) {
    return "رقم الهاتف يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094 أو 095";
  }

  return null;
}

export default function CompleteProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const googleName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";

      const googleAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        "";

      setName(googleName);
      setAvatarUrl(googleAvatar);

      setLoading(false);
    }

    loadUser();
  }, [router]);

  async function handleComplete() {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    const nameError = validateName(cleanName);

    if (nameError) {
      alert(nameError);
      return;
    }

    const phoneError = validatePhone(cleanPhone);

    if (phoneError) {
      alert(phoneError);
      return;
    }

    setSaving(true);

    // التأكد من أن الرقم غير مستخدم
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", cleanPhone)
      .neq("id", userId)
      .maybeSingle();

    if (existingProfile) {
      alert("رقم الهاتف مستخدم مسبقاً");
      setSaving(false);
      return;
    }

    const updateData: {
      full_name: string;
      phone: string;
      avatar_url?: string;
    } = {
      full_name: cleanName,
      phone: cleanPhone,
    };

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      console.error(error);
      alert("حدث خطأ أثناء إكمال الحساب");
      setSaving(false);
      return;
    }

    router.replace("/mood-space");
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#0b1428] flex items-center justify-center text-white"
      >
        جاري تحميل الحساب...
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#0b1428]
        flex
        items-center
        justify-center
        px-5
        py-10
        text-white
      "
    >
      <div
        className="
          w-full
          max-w-md
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          p-6
          shadow-2xl
        "
      >
        <div className="text-center mb-8">
          <img
            src={avatarUrl || "/menu/logo.png"}
            alt="صورة الحساب"
            className="
              w-24
              h-24
              mx-auto
              mb-5
              rounded-full
              object-cover
              border-2
              border-[#d4af37]
            "
          />

          <h1 className="text-2xl font-bold">
            أكمل حسابك في Lavaza ☕
          </h1>

          <p className="text-white/60 text-sm mt-2">
            نحتاج إلى رقم هاتفك لإكمال حسابك
          </p>
        </div>

        <input
          placeholder="الاسم الكامل"
          value={name}
          maxLength={15}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full
            mb-2
            p-4
            rounded-2xl
            bg-white/10
            border
            border-white/10
            outline-none
            focus:border-[#d4af37]
          "
        />

        <div className="text-left text-xs text-white/40 mb-4">
          {Array.from(name).length}/15
        </div>

        <input
          placeholder="رقم الهاتف"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setPhone(value.slice(0, 10));
          }}
          className="
            w-full
            mb-6
            p-4
            rounded-2xl
            bg-white/10
            border
            border-white/10
            outline-none
            focus:border-[#d4af37]
          "
        />

        <button
          type="button"
          onClick={handleComplete}
          disabled={saving}
          className="
            w-full
            bg-[#d4af37]
            text-[#16284a]
            py-4
            rounded-full
            font-bold
            text-lg
            active:scale-95
            transition
            disabled:opacity-50
          "
        >
          {saving
            ? "جاري إكمال الحساب..."
            : "إكمال الحساب"}
        </button>
      </div>
    </main>
  );
}