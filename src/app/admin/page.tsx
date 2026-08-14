import { redirect } from "next/navigation";
import { isAdmin } from "@/features/admin/api";
import { createClient } from "@/services/supabase/server";
import Link from "next/link";
import {
  Shield,
  Coffee,
  Users,
  FileText,
  Heart,
  ArrowLeft,
  Settings,
} from "lucide-react";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/mood-space");
  }

  const supabase = await createClient();

  // عدد المستخدمين
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    });

  // عدد المنشورات
  const { count: postsCount } = await supabase
    .from("posts")
    .select("*", {
      count: "exact",
      head: true,
    });

  // عدد الإعجابات
  const { count: likesCount } = await supabase
    .from("likes")
    .select("*", {
      count: "exact",
      head: true,
    });

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#0f1d35]
        px-4
        py-8
        text-white
      "
    >
      <div className="mx-auto max-w-5xl">

        {/* ================= HEADER ================= */}

        <div
          className="
            mb-8
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#d4af37]
                text-[#16284a]
                shadow-lg
              "
            >
              <Shield size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                لوحة الإدارة
              </h1>

              <p className="mt-1 text-sm text-white/50">
                مركز التحكم بمنصة Lavaza
              </p>
            </div>

          </div>

          <Link
            href="/mood-space"
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white/70
              transition
              hover:bg-white/10
              hover:text-white
              active:scale-95
            "
          >
            <ArrowLeft size={17} />

            المنصة
          </Link>

        </div>


        {/* ================= WELCOME ================= */}

        <section
          className="
            mb-6
            overflow-hidden
            rounded-[2rem]
            border
            border-[#d4af37]/20
            bg-gradient-to-br
            from-[#16284a]
            to-[#111f38]
            p-6
            shadow-xl
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#d4af37]/10
                text-3xl
              "
            >
              ☕
            </div>

            <div>

              <h2 className="text-lg font-bold">
                مرحباً بك في مركز التحكم
              </h2>

              <p className="mt-1 text-sm leading-6 text-white/50">
                من هنا يمكنك إدارة مجتمع Lavaza Mood ومستخدمي المنصة.
              </p>

            </div>

          </div>

        </section>


        {/* ================= STATISTICS ================= */}

        <div
          className="
            mb-6
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-3
          "
        >

          {/* Users */}

          <div
            className="
              rounded-[1.7rem]
              border
              border-white/10
              bg-[#16284a]
              p-5
              shadow-lg
            "
          >

            <div className="flex items-center justify-between">

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-400/10
                  text-blue-300
                "
              >
                <Users size={21} />
              </div>

              <span className="text-xs text-white/40">
                الحسابات
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold">
              {usersCount ?? 0}
            </p>

            <p className="mt-1 text-sm text-white/40">
              مستخدم
            </p>

          </div>


          {/* Posts */}

          <div
            className="
              rounded-[1.7rem]
              border
              border-white/10
              bg-[#16284a]
              p-5
              shadow-lg
            "
          >

            <div className="flex items-center justify-between">

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#d4af37]/10
                  text-[#d4af37]
                "
              >
                <FileText size={21} />
              </div>

              <span className="text-xs text-white/40">
                المحتوى
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold">
              {postsCount ?? 0}
            </p>

            <p className="mt-1 text-sm text-white/40">
              منشور
            </p>

          </div>


          {/* Likes */}

          <div
            className="
              rounded-[1.7rem]
              border
              border-white/10
              bg-[#16284a]
              p-5
              shadow-lg
            "
          >

            <div className="flex items-center justify-between">

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-400/10
                  text-red-300
                "
              >
                <Heart size={21} />
              </div>

              <span className="text-xs text-white/40">
                التفاعل
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold">
              {likesCount ?? 0}
            </p>

            <p className="mt-1 text-sm text-white/40">
              إعجاب
            </p>

          </div>

        </div>


        {/* ================= MANAGEMENT ================= */}

        <h2 className="mb-4 text-lg font-bold">
          إدارة المنصة
        </h2>


        <div className="grid gap-4 sm:grid-cols-2">

          {/* Mood Space */}

          <Link
            href="/admin/mood"
            className="
              group
              rounded-[2rem]
              border
              border-white/10
              bg-[#16284a]
              p-6
              shadow-xl
              transition
              hover:-translate-y-1
              hover:border-[#d4af37]/40
              hover:shadow-2xl
              active:scale-[0.98]
            "
          >

            <div className="flex items-start justify-between">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#d4af37]/10
                  text-[#d4af37]
                "
              >
                <Coffee size={28} />
              </div>

              <ArrowLeft
                size={20}
                className="
                  text-white/20
                  transition
                  group-hover:-translate-x-1
                  group-hover:text-[#d4af37]
                "
              />

            </div>

            <h3 className="mt-6 text-lg font-bold">
              إدارة Mood Space
            </h3>

            <p className="mt-2 text-sm leading-7 text-white/50">
              مشاهدة وإدارة منشورات المجتمع وحذف المحتوى المخالف.
            </p>

            <div className="mt-5 text-sm font-bold text-[#d4af37]">
              فتح الإدارة
            </div>

          </Link>


          {/* Users */}

          <Link
            href="/admin/users"
            className="
              group
              rounded-[2rem]
              border
              border-white/10
              bg-[#16284a]
              p-6
              shadow-xl
              transition
              hover:-translate-y-1
              hover:border-blue-400/30
              hover:shadow-2xl
              active:scale-[0.98]
            "
          >

            <div className="flex items-start justify-between">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-400/10
                  text-blue-300
                "
              >
                <Users size={28} />
              </div>

              <ArrowLeft
                size={20}
                className="
                  text-white/20
                  transition
                  group-hover:-translate-x-1
                  group-hover:text-blue-300
                "
              />

            </div>

            <h3 className="mt-6 text-lg font-bold">
              إدارة المستخدمين
            </h3>

            <p className="mt-2 text-sm leading-7 text-white/50">
              مشاهدة الحسابات وإدارة المستخدمين وحذف الحسابات عند الحاجة.
            </p>

            <div className="mt-5 text-sm font-bold text-blue-300">
              فتح الإدارة
            </div>

          </Link>


          {/* Future Settings */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-white/5
              bg-white/[0.02]
              p-6
              opacity-60
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-white/5
                text-white/30
              "
            >
              <Settings size={27} />
            </div>

            <h3 className="mt-6 text-lg font-bold text-white/60">
              إعدادات المنصة
            </h3>

            <p className="mt-2 text-sm leading-7 text-white/30">
              إعدادات عامة وتحكم متقدم بالمنصة.
            </p>

            <div className="mt-5 text-xs font-bold text-white/30">
              قريباً
            </div>

          </div>

        </div>


        {/* ================= FOOTER ================= */}

        <div className="mt-10 text-center">

          <p className="text-xs text-white/20">
            Lavaza Admin Panel
          </p>

        </div>

      </div>
    </main>
  );
}