"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  Clock,
  MessageSquare,
  Save,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { supabase } from "@/services/supabase/client";

type FeedbackProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

type Feedback = {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  message: string;
  wants_contact: boolean;
  status: string;
  admin_note: string | null;
  created_at: string;
  profiles:
    | FeedbackProfile
    | FeedbackProfile[]
    | null;
};

type Props = {
  initialFeedback: Feedback[];
};

const STATUS_LABELS: Record<string, string> = {
  new: "جديدة",
  reviewing: "قيد المراجعة",
  resolved: "تم الحل",
};

const TYPE_LABELS: Record<string, string> = {
  suggestion: "اقتراح",
  problem: "مشكلة",
  complaint: "شكوى",
  other: "أخرى",
};

export default function FeedbackManager({
  initialFeedback,
}: Props) {
  const [feedback, setFeedback] =
    useState<Feedback[]>(initialFeedback);

  const [filter, setFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [selected, setSelected] =
    useState<Feedback | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [adminNote, setAdminNote] =
    useState("");

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {

      const matchesStatus =
        filter === "all" ||
        item.status === filter;

      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;

      const searchText = `
        ${item.subject}
        ${item.message}
        ${profile?.full_name ?? ""}
        ${profile?.phone ?? ""}
      `.toLowerCase();

      const matchesSearch =
        !search ||
        searchText.includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [feedback, filter, search]);

  const newCount = feedback.filter(
    (item) => item.status === "new"
  ).length;

  const reviewingCount = feedback.filter(
    (item) => item.status === "reviewing"
  ).length;

  const resolvedCount = feedback.filter(
    (item) => item.status === "resolved"
  ).length;

  function getProfile(item: Feedback) {
    return Array.isArray(item.profiles)
      ? item.profiles[0]
      : item.profiles;
  }

  function openFeedback(item: Feedback) {
    setSelected(item);
    setAdminNote(item.admin_note ?? "");
  }

  async function updateFeedback(
    id: string,
    updates: {
      status?: string;
      admin_note?: string;
    }
  ) {
    setSaving(true);

    const { error } = await supabase
      .from("feedback")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error(
        "FEEDBACK UPDATE ERROR:",
        error
      );

      alert("حدث خطأ أثناء حفظ التعديل");

      setSaving(false);
      return;
    }

    setFeedback((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );

    setSelected((current) =>
      current && current.id === id
        ? {
            ...current,
            ...updates,
          }
        : current
    );

    setSaving(false);
  }

  async function saveNote() {
    if (!selected) return;

    await updateFeedback(
      selected.id,
      {
        admin_note: adminNote,
      }
    );
  }

  async function changeStatus(
    status: string
  ) {
    if (!selected) return;

    await updateFeedback(
      selected.id,
      {
        status,
      }
    );
  }

  return (
    <>
      {/* Statistics */}

      <div
        className="
          mb-6
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-4
        "
      >

        <Stat
          label="الكل"
          value={feedback.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />

        <Stat
          label="جديدة"
          value={newCount}
          active={filter === "new"}
          onClick={() => setFilter("new")}
          danger
        />

        <Stat
          label="قيد المراجعة"
          value={reviewingCount}
          active={filter === "reviewing"}
          onClick={() =>
            setFilter("reviewing")
          }
        />

        <Stat
          label="تم الحل"
          value={resolvedCount}
          active={filter === "resolved"}
          onClick={() =>
            setFilter("resolved")
          }
        />

      </div>

      {/* Search */}

      <div className="relative mb-6">

        <Search
          size={19}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-white/30
          "
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="ابحث في الملاحظات..."
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-[#16284a]
            py-4
            pr-12
            pl-4
            text-white
            outline-none
            placeholder:text-white/30
            focus:border-[#d4af37]
          "
        />

      </div>

      {/* Feedback List */}

      {filteredFeedback.length === 0 ? (

        <div
          className="
            rounded-[2rem]
            border
            border-white/10
            bg-[#16284a]
            p-12
            text-center
          "
        >

          <MessageSquare
            size={42}
            className="
              mx-auto
              mb-4
              text-white/20
            "
          />

          <p className="text-white/40">
            لا توجد ملاحظات هنا
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {filteredFeedback.map((item) => {

            const profile =
              getProfile(item);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  openFeedback(item)
                }
                className="
                  w-full
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-[#16284a]
                  p-5
                  text-right
                  shadow-lg
                  transition
                  hover:border-[#d4af37]/30
                  hover:bg-[#182b50]
                  active:scale-[0.99]
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-4
                  "
                >

                  {/* Avatar */}

                  <div className="shrink-0">

                    {profile?.avatar_url ? (

                      <Image
                        src={profile.avatar_url}
                        alt=""
                        width={48}
                        height={48}
                        className="
                          h-12
                          w-12
                          rounded-full
                          object-cover
                          border
                          border-[#d4af37]/30
                        "
                      />

                    ) : (

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-full
                          bg-white/5
                          text-white/30
                        "
                      >
                        <UserRound size={22} />
                      </div>

                    )}

                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >

                      <h3 className="font-bold">
                        {item.subject}
                      </h3>

                      <StatusBadge
                        status={item.status}
                      />

                    </div>

                    <p className="mt-1 text-xs text-white/40">
                      {profile?.full_name ||
                        "مستخدم Lavaza"}
                    </p>

                    <p
                      className="
                        mt-3
                        line-clamp-2
                        text-sm
                        leading-7
                        text-white/60
                      "
                    >
                      {item.message}
                    </p>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <span className="text-xs text-white/30">
                        {TYPE_LABELS[item.type] ||
                          item.type}
                      </span>

                      <span className="text-xs text-white/30">
                        {formatDate(
                          item.created_at
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </button>
            );
          })}

        </div>

      )}

      {/* Details Modal */}

      {selected && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            px-4
            py-6
            backdrop-blur-sm
          "
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-xl
              overflow-y-auto
              rounded-[2rem]
              border
              border-white/10
              bg-[#16284a]
              p-6
              shadow-2xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div
              className="
                mb-6
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div>

                <p className="text-xs text-[#d4af37]">
                  {TYPE_LABELS[selected.type] ||
                    selected.type}
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {selected.subject}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white/5
                  text-white/50
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* User */}

            {(() => {
              const profile =
                getProfile(selected);

              return (
                <div
                  className="
                    mb-6
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-white/5
                    p-4
                  "
                >

                  {profile?.avatar_url ? (

                    <Image
                      src={profile.avatar_url}
                      alt=""
                      width={44}
                      height={44}
                      className="
                        h-11
                        w-11
                        rounded-full
                        object-cover
                      "
                    />

                  ) : (

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-white/5
                      "
                    >
                      <UserRound
                        size={20}
                        className="text-white/30"
                      />
                    </div>

                  )}

                  <div>

                    <p className="font-bold">
                      {profile?.full_name ||
                        "مستخدم Lavaza"}
                    </p>

                    {profile?.phone && (
                      <p className="mt-1 text-xs text-white/40">
                        {profile.phone}
                      </p>
                    )}

                  </div>

                </div>
              );
            })()}

            {/* Message */}

            <div
              className="
                rounded-2xl
                bg-white/5
                p-5
              "
            >

              <p className="whitespace-pre-wrap text-sm leading-8 text-white/80">
                {selected.message}
              </p>

            </div>

            {/* Contact */}

            <div
              className="
                mt-4
                rounded-2xl
                border
                border-white/5
                bg-white/[0.03]
                p-4
              "
            >

              <p className="text-xs text-white/40">
                يرغب بالتواصل معه؟
              </p>

              <p
                className={`mt-2 font-bold ${
                  selected.wants_contact
                    ? "text-green-300"
                    : "text-white/40"
                }`}
              >
                {selected.wants_contact
                  ? "نعم"
                  : "لا"}
              </p>

            </div>

            {/* Status */}

            <div className="mt-6">

              <p className="mb-3 text-sm font-bold">
                حالة الملاحظة
              </p>

              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                "
              >

                <StatusButton
                  active={
                    selected.status === "new"
                  }
                  onClick={() =>
                    changeStatus("new")
                  }
                >
                  <MessageSquare size={16} />
                  جديدة
                </StatusButton>

                <StatusButton
                  active={
                    selected.status ===
                    "reviewing"
                  }
                  onClick={() =>
                    changeStatus(
                      "reviewing"
                    )
                  }
                >
                  <Clock size={16} />
                  مراجعة
                </StatusButton>

                <StatusButton
                  active={
                    selected.status ===
                    "resolved"
                  }
                  onClick={() =>
                    changeStatus(
                      "resolved"
                    )
                  }
                >
                  <Check size={16} />
                  تم الحل
                </StatusButton>

              </div>

            </div>

            {/* Admin Note */}

            <div className="mt-6">

              <div className="mb-3 flex items-center justify-between">

                <p className="text-sm font-bold">
                  ملاحظة داخلية
                </p>

                <span className="text-xs text-white/30">
                  للأدمن فقط
                </span>

              </div>

              <textarea
                value={adminNote}
                onChange={(e) =>
                  setAdminNote(
                    e.target.value
                  )
                }
                placeholder="اكتب ملاحظة داخلية..."
                className="
                  min-h-28
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-4
                  text-sm
                  leading-7
                  text-white
                  outline-none
                  placeholder:text-white/25
                  focus:border-[#d4af37]
                "
              />

              <button
                type="button"
                onClick={saveNote}
                disabled={saving}
                className="
                  mt-3
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#d4af37]
                  py-3.5
                  font-bold
                  text-[#16284a]
                  transition
                  active:scale-[0.98]
                  disabled:opacity-50
                "
              >

                <Save size={18} />

                {saving
                  ? "جاري الحفظ..."
                  : "حفظ الملاحظة"}

              </button>

            </div>

            <p className="mt-5 text-center text-xs text-white/25">
              {formatDate(
                selected.created_at
              )}
            </p>

          </div>

        </div>

      )}

    </>
  );
}

/* ========================= */

function Stat({
  label,
  value,
  active,
  onClick,
  danger = false,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-2xl
        border
        p-4
        text-right
        transition
        ${
          active
            ? "border-[#d4af37]/40 bg-[#d4af37]/10"
            : "border-white/10 bg-[#16284a]"
        }
      `}
    >

      <p className="text-xs text-white/40">
        {label}
      </p>

      <p
        className={`
          mt-2
          text-2xl
          font-black
          ${
            danger && value > 0
              ? "text-red-300"
              : "text-[#d4af37]"
          }
        `}
      >
        {value}
      </p>

    </button>
  );
}

/* ========================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    new:
      "bg-red-400/10 text-red-300 border-red-400/20",

    reviewing:
      "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",

    resolved:
      "bg-green-400/10 text-green-300 border-green-400/20",
  };

  return (
    <span
      className={`
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-bold
        ${
          styles[status] ||
          "bg-white/5 text-white/40 border-white/10"
        }
      `}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ========================= */

function StatusButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        justify-center
        gap-1.5
        rounded-xl
        border
        py-3
        text-xs
        font-bold
        transition
        ${
          active
            ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
            : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ========================= */

function formatDate(date: string) {
  return new Date(date).toLocaleString(
    "ar-LY",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}