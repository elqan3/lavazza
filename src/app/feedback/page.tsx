"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/services/supabase/client";

const FEEDBACK_TYPES = [
  {
    value: "feedback",
    label: "رأيي وتجربتي",
    emoji: "💬",
  },
  {
    value: "suggestion",
    label: "اقتراح",
    emoji: "💡",
  },
  {
    value: "problem",
    label: "مشكلة أو شكوى",
    emoji: "⚠️",
  },
  {
    value: "appreciation",
    label: "شكر وتقدير",
    emoji: "❤️",
  },
  {
    value: "other",
    label: "أخرى",
    emoji: "📝",
  },
];

export default function FeedbackPage() {
  const [type, setType] = useState("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [wantsContact, setWantsContact] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      alert("اكتب رسالتك أولاً");
      return;
    }

    if (message.trim().length < 5) {
      alert("يرجى كتابة رسالة أوضح");
      return;
    }

    if (message.trim().length > 1000) {
      alert("الرسالة يجب ألا تتجاوز 1000 حرف");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("يجب تسجيل الدخول لإرسال الملاحظات");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      type,
      subject: subject.trim() || null,
      message: message.trim(),
      wants_contact: wantsContact,
    });

    if (error) {
      console.error("FEEDBACK ERROR:", error);
      alert("حدث خطأ أثناء إرسال الملاحظة");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setSubject("");
    setMessage("");
    setWantsContact(false);
    setLoading(false);
  }

  if (success) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-[#0b1428]
          px-5
          py-10
          pb-40
          text-white
          flex
          items-center
          justify-center
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-[2rem]
            border
            border-white/10
            bg-[#16284a]
            p-8
            text-center
            shadow-2xl
          "
        >
          <div
            className="
              mx-auto
              mb-5
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-[#d4af37]/15
              text-4xl
            "
          >
            ❤️
          </div>

          <h1 className="text-2xl font-bold">
            شكرًا لك!
          </h1>

          <p className="mt-3 leading-7 text-white/60">
            وصلت ملاحظتك إلى فريق Lavaza.
            <br />
            رأيك يساعدنا على تحسين تجربتك.
          </p>

          <Link
            href="/mood-space"
            className="
              mt-7
              flex
              w-full
              items-center
              justify-center
              rounded-full
              bg-[#d4af37]
              py-4
              font-bold
              text-[#16284a]
              transition
              active:scale-95
            "
          >
            العودة إلى Mood Space
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#0b1428]
        px-5
        py-8
        pb-40
        text-white
      "
    >
      <div className="mx-auto w-full max-w-xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <Link
            href="/mood-space"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white/5
              text-white/70
              transition
              hover:bg-white/10
              active:scale-90
            "
            aria-label="العودة"
          >
            <ArrowRight size={20} />
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <MessageSquare
                size={20}
                className="text-[#d4af37]"
              />

              <h1 className="text-xl font-bold">
                شاركنا رأيك
              </h1>
            </div>

            <p className="mt-1 text-xs text-white/40">
              رأيك يساعدنا على تحسين Lavaza
            </p>
          </div>

          <div className="h-10 w-10" />
        </div>

        {/* Card */}

        <div
          className="
            rounded-[2rem]
            border
            border-white/10
            bg-[#16284a]
            p-5
            shadow-2xl
          "
        >

          {/* Type */}

          <div>
            <label className="mb-3 block text-sm font-bold">
              ما نوع رسالتك؟
            </label>

            <div className="grid grid-cols-2 gap-3">

              {FEEDBACK_TYPES.map((item) => {
                const selected = type === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-right
                      transition
                      active:scale-[0.97]
                      ${
                        selected
                          ? "border-[#d4af37]/50 bg-[#d4af37]/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }
                    `}
                  >
                    <div className="text-xl">
                      {item.emoji}
                    </div>

                    <div
                      className={`
                        mt-2
                        text-sm
                        font-semibold
                        ${
                          selected
                            ? "text-[#d4af37]"
                            : "text-white/70"
                        }
                      `}
                    >
                      {item.label}
                    </div>
                  </button>
                );
              })}

            </div>
          </div>

          {/* Subject */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-bold">
              الموضوع
              <span className="mr-2 text-xs font-normal text-white/30">
                اختياري
              </span>
            </label>

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              placeholder="مثلاً: تجربة الطلب"
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-4
                text-white
                outline-none
                placeholder:text-white/30
                focus:border-[#d4af37]
              "
            />

          </div>

          {/* Message */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-bold">
              رسالتك
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={7}
              placeholder="اكتب لنا رأيك أو اقتراحك أو المشكلة التي واجهتها..."
              className="
                w-full
                resize-none
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-4
                leading-7
                text-white
                outline-none
                placeholder:text-white/30
                focus:border-[#d4af37]
              "
            />

            <div className="mt-2 text-left text-xs text-white/30">
              {message.length}/1000
            </div>

          </div>

          {/* Contact */}

          <button
            type="button"
            onClick={() => setWantsContact((value) => !value)}
            className="
              mt-5
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              bg-white/5
              p-4
              text-right
              transition
              hover:bg-white/10
            "
          >
            <div
              className={`
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-md
                border
                transition
                ${
                  wantsContact
                    ? "border-[#d4af37] bg-[#d4af37] text-[#16284a]"
                    : "border-white/20"
                }
              `}
            >
              {wantsContact && "✓"}
            </div>

            <div>
              <p className="text-sm font-semibold">
                أريد أن تتواصلوا معي بخصوص هذه الملاحظة
              </p>

              <p className="mt-1 text-xs text-white/40">
                سنستخدم رقم الهاتف المرتبط بحسابك
              </p>
            </div>
          </button>

          {/* Submit */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#d4af37]
              py-4
              text-lg
              font-bold
              text-[#16284a]
              transition
              active:scale-[0.97]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Send size={20} />

            {loading
              ? "جاري الإرسال..."
              : "إرسال الملاحظة"}
          </button>

        </div>

        <p className="mt-5 text-center text-xs leading-6 text-white/30">
          نحن نقرأ ملاحظاتكم ونعمل باستمرار على تحسين تجربة Lavaza ☕
        </p>

      </div>
    </main>
  );
}