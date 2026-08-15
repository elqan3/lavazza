"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error);
    alert("تعذر تسجيل الدخول باستخدام Google");
  }
}
  async function handleLogin() {
    if (!phone || !password) {
      alert("أدخل رقم الهاتف وكلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const fakeEmail = `user_${phone}@lavaza.app`;

      /*
       * تسجيل الدخول
       */
      const {
        data: authData,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      if (loginError || !authData.user) {
        alert("رقم الهاتف أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      /*
       * تسجيل الدخول اليومي
       *
       * قاعدة البيانات هي التي تحدد:
       * +5 يوميًا
       * زيادة الـ streak
       * +30 كل 5 أيام متواصلة
       * وعدم تكرار المكافأة في نفس اليوم
       */
      const { error: pointsError } = await supabase.rpc(
        "record_daily_login",
        {
          target_user_id: userId,
        }
      );

      /*
       * مهم:
       * فشل تسجيل النقاط لا يعني أن تسجيل الدخول فشل.
       *
       * المستخدم دخل حسابه بالفعل، لذلك نسمح له بالمتابعة.
       * لكن نسجل الخطأ في Console حتى نكتشفه أثناء التطوير.
       */
      if (pointsError) {
        console.error(
          "DAILY LOGIN POINTS ERROR:",
          pointsError
        );
      }

      /*
       * الانتقال إلى Mood Space
       */
      router.push("/mood-space");
      router.refresh();

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      alert("حدث خطأ غير متوقع أثناء تسجيل الدخول");

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

        {/* Logo + Title */}

        <div className="text-center mb-8">

          <Image
            src="/menu/logo.png"
            alt="Lavaza"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />

          <h1 className="text-2xl font-bold">
            أهلاً بعودتك ☕
          </h1>

          <p className="text-white/60 mt-2 text-sm">
            سجّل الدخول إلى Lavaza Mood
          </p>

        </div>
<div className="mt-6">
  <button
    type="button"
    onClick={handleGoogleLogin}
    className="
      w-full
      bg-white
      text-[#1a2a4a]
      py-4
      rounded-full
      font-bold
      flex
      items-center
      justify-center
      gap-3
      shadow-lg
      hover:bg-gray-100
      transition
      active:scale-95
    "
  >
    <span className="text-lg font-bold">
      G
    </span>

    متابعة باستخدام Google
  </button>
</div>

<div className="flex items-center gap-3 my-6">
  <div className="h-px flex-1 bg-white/10" />

  <span className="text-xs text-white/40">
    أو تسجيل الدخول بالطريقة المعتادة
  </span>

  <div className="h-px flex-1 bg-white/10" />
</div>

        {/* Phone */}

        <input
          type="text"
          placeholder="رقم الهاتف"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
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
            disabled:opacity-50
          "
        />


        {/* Password */}

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
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
            disabled:opacity-50
          "
        />


        {/* Login Button */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full
            py-4
            rounded-full
            bg-[#d4af37]
            text-[#16284a]
            font-bold
            text-lg
            transition
            active:scale-95
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {loading
            ? "جاري تسجيل الدخول..."
            : "تسجيل الدخول"}
        </button>


        {/* Register */}

        <div className="text-center mt-6 text-sm text-white/70">

          ليس لديك حساب؟

          <Link
            href="/auth"
            className="text-[#d4af37] font-bold mr-2"
          >
            إنشاء حساب
          </Link>

        </div>

      </div>

    </main>
  );
}