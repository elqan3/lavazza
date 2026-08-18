import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageSquare, Shield } from "lucide-react";

import { isAdmin } from "@/features/admin/api";
import { createClient } from "@/services/supabase/server";
import FeedbackManager from "./FeedbackManager";

export default async function AdminFeedbackPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/mood-space");
  }

  const supabase = await createClient();

 const { data: feedback, error } = await supabase
  .from("feedback")
  .select(`
    id,
    user_id,
    type,
    subject,
    message,
    wants_contact,
    status,
    admin_note,
    created_at
  `)
  .order("created_at", {
    ascending: false,
  });

if (error) {
  console.error("FEEDBACK LOAD ERROR:", error);
}

const userIds = [
  ...new Set(
    (feedback ?? [])
      .map((item) => item.user_id)
      .filter(Boolean)
  ),
];

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

let profiles: Profile[] = [];

if (userIds.length > 0) {
  const { data: profilesData, error: profilesError } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        phone
      `)
      .in("id", userIds);

  if (profilesError) {
    console.error(
      "FEEDBACK PROFILES ERROR:",
      profilesError
    );
  }

  profiles = profilesData ?? [];
}

const profileMap = new Map(
  profiles.map((profile) => [
    profile.id,
    profile,
  ])
);

const feedbackWithProfiles = (feedback ?? []).map(
  (item) => ({
    ...item,
    profiles: item.user_id
      ? profileMap.get(item.user_id) ?? null
      : null,
  })
);
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

        {/* Header */}

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
              <MessageSquare size={24} />
            </div>

            <div>

              <h1 className="text-2xl font-bold">
                ملاحظات العملاء
              </h1>

              <p className="mt-1 text-sm text-white/50">
                آراء واقتراحات ومشاكل مجتمع Lavaza
              </p>

            </div>

          </div>

          <Link
            href="/admin"
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
            <ArrowRight size={17} />

            لوحة الإدارة
          </Link>

        </div>

        {/* Content */}

        {error ? (

          <div
            className="
              rounded-[2rem]
              border
              border-red-400/20
              bg-red-400/5
              p-8
              text-center
              text-red-300
            "
          >
            حدث خطأ أثناء تحميل الملاحظات.
          </div>

        ) : (

          <FeedbackManager
  initialFeedback={feedbackWithProfiles}
/>

        )}

      </div>
    </main>
  );
}