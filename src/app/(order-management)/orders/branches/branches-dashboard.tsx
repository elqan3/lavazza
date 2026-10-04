"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Store } from "lucide-react";

import {
  loadManagedBranches,
  setBranchActive,
  type ManagedBranch,
} from "./actions";

export default function BranchesDashboard() {
  const [branches, setBranches] = useState<ManagedBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);
      setBranches(await loadManagedBranches());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "تعذر تحميل الفروع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(branch: ManagedBranch) {
    try {
      setSavingId(branch.id);
      setError("");
      await setBranchActive(branch.id, !branch.is_active);
      setBranches((current) =>
        current.map((item) =>
          item.id === branch.id
            ? { ...item, is_active: !item.is_active }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "تعذر تحديث الفرع.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#07111f] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-white/40">LAVAZA MOD</p>
            <h1 className="mt-1 text-3xl font-black">إدارة الفروع</h1>
            <p className="mt-2 text-sm text-white/45">
              تحكم في الفروع التي يمكن للعملاء اختيارها عند الطلب.
            </p>
          </div>

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white"
          >
            <ArrowRight size={17} />
            الطلبات
          </Link>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        <section className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-12">
              <Loader2 className="animate-spin text-white/40" size={24} />
            </div>
          ) : (
            branches.map((branch) => {
              const saving = savingId === branch.id;

              return (
                <div
                  key={branch.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5">
                      <Store size={21} className="text-[#d4af37]" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-black">{branch.name}</p>
                      <p className={`mt-1 text-xs ${
                        branch.is_active ? "text-green-300" : "text-white/35"
                      }`}>
                        {branch.is_active ? "متاح للعملاء" : "متوقف عن استقبال الطلبات"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(branch)}
                    disabled={saving}
                    aria-pressed={branch.is_active}
                    aria-label={branch.is_active ? `إيقاف ${branch.name}` : `تفعيل ${branch.name}`}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                      branch.is_active ? "bg-[#d4af37]" : "bg-white/15"
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                        branch.is_active ? "right-1" : "right-7"
                      }`}
                    />
                  </button>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
