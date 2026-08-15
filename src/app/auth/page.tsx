"use client";

import { useState } from "react";
import { supabase } from "@/services/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import {
  validateName,
  validatePhone,
} from "@/features/auth/validation";

export default function AuthPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleRegister() {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    // التأكد من اكتمال البيانات
    if (
      !avatar ||
      !cleanName ||
      !cleanPhone ||
      !password
    ) {
      alert("أكمل جميع البيانات");
      return;
    }

    // التحقق من الاسم
    const nameError = validateName(cleanName);

    if (nameError) {
      alert(nameError);
      return;
    }

    // التحقق من الهاتف
    const phoneError = validatePhone(cleanPhone);

    if (phoneError) {
      alert(phoneError);
      return;
    }

    setLoading(true);

    try {
      const fakeEmail = `user_${cleanPhone}@lavaza.app`;

      // التأكد من أن الهاتف غير مستخدم
      const { data: existingUser, error: phoneCheckError } =
        await supabase
          .from("profiles")
          .select("id")
          .eq("phone", cleanPhone)
          .maybeSingle();

      if (phoneCheckError) {
        console.log(phoneCheckError);
        alert("حدث خطأ أثناء التحقق من رقم الهاتف");
        return;
      }

      if (existingUser) {
        alert("رقم الهاتف مستخدم مسبقاً");
        return;
      }

      // إنشاء الحساب
      const { data, error } =
        await supabase.auth.signUp({
          email: fakeEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone,
            },
          },
        });

      if (error) {
        console.log(error);
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("حدث خطأ أثناء إنشاء الحساب");
        return;
      }

      // رفع الصورة الشخصية
      const fileName = `${user.id}.jpg`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(
            fileName,
            avatar,
            {
              upsert: true,
            }
          );

      if (uploadError) {
        console.log(uploadError);
        alert(uploadError.message);
        return;
      }

      // الحصول على رابط الصورة
      const { data: urlData } =
        supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // تحديث البروفايل
      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
          })
          .eq("id", user.id);

      if (profileError) {
        console.log(profileError);
      }

      // الانتقال بعد التسجيل
      router.push("/create-post");
    } finally {
      setLoading(false);
    }
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
        {/* Header */}

        <div className="text-center mb-8">
          <img
            src="/menu/logo.png"
            alt="Lavaza"
            className="w-20 mx-auto mb-4"
          />

          <h1 className="text-2xl font-bold">
            انضم إلى Lavaza Mood ☕
          </h1>

          <p className="text-white/60 text-sm mt-2">
            اصنع حسابك وشارك لحظاتك
          </p>
        </div>

        {/* Avatar */}

        <label className="cursor-pointer flex justify-center mb-6">
          <div
            className="
              w-28
              h-28
              rounded-full
              overflow-hidden
              border-2
              border-[#d4af37]
              bg-white/10
              flex
              items-center
              justify-center
            "
          >
            {preview ? (
              <img
                src={preview}
                alt="صورة الحساب"
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            ) : (
              <span className="text-4xl">
                📷
              </span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </label>

        <p
          className="
            text-center
            text-xs
            text-white/50
            mb-6
          "
        >
          اختر صورتك الشخصية
        </p>

        {/* Name */}

        <input
          placeholder="الاسم الكامل"
          value={name}
          maxLength={15}
          onChange={(e) =>
            setName(e.target.value)
          }
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

        <div
          className="
            text-left
            text-xs
            text-white/40
            mb-4
          "
        >
          {Array.from(name).length}/15
        </div>

        {/* Phone */}

        <input
          placeholder="رقم الهاتف"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => {
            const value =
              e.target.value.replace(
                /\D/g,
                ""
              );

            setPhone(
              value.slice(0, 10)
            );
          }}
          className="
            w-full
            mb-4
            p-4
            rounded-2xl
            bg-white/10
            border
            border-white/10
            outline-none
            focus:border-[#d4af37]
          "
        />

        {/* Password */}

        <div className="relative mb-6">
          <input
            placeholder="كلمة المرور"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              p-4
              pl-12
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
            onClick={() =>
              setShowPassword(
                (value) => !value
              )
            }
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-white/50
              hover:text-white
              transition
            "
            aria-label={
              showPassword
                ? "إخفاء كلمة المرور"
                : "إظهار كلمة المرور"
            }
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>

        {/* Register */}

        <button
          onClick={handleRegister}
          disabled={loading}
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
          {loading
            ? "جاري إنشاء الحساب..."
            : "إنشاء حساب"}
        </button>

        {/* Login */}

        <div
          className="
            text-center
            mt-6
            text-sm
            text-white/70
          "
        >
          لديك حساب بالفعل؟

          <a
            href="/login"
            className="
              text-[#d4af37]
              font-bold
              mr-2
            "
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    </main>
  );
}