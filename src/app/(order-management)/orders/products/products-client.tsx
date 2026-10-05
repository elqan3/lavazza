"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Package, RefreshCw, Search, X } from "lucide-react";
import {
  loadManagementProducts,
  setProductAvailability,
  type ManagementProduct,
} from "./actions";

type Props = { initialProducts: ManagementProduct[] };

export default function ProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.name, product.category_name ?? ""].join(" ").toLocaleLowerCase().includes(term),
    );
  }, [products, search]);

  const availableCount = products.filter((p) => p.is_available).length;
  const unavailableCount = products.length - availableCount;

  function refresh() {
    startRefresh(async () => {
      try {
        setProducts(await loadManagementProducts());
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر تحديث المنتجات.");
      }
    });
  }

  async function toggle(product: ManagementProduct) {
    try {
      setPendingId(product.id);
      const updated = await setProductAvailability(product.id, !product.is_available);
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, is_available: updated?.is_available ?? !item.is_available }
            : item,
        ),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "تعذر تحديث توفر المنتج.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-neutral-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-500">لافازا مود</p>
              <h1 className="mt-1 text-2xl font-black text-neutral-900">توفر المنتجات</h1>
              <p className="mt-1 text-sm text-neutral-500">أخفِ المنتج مؤقتًا من قائمة الطلب عندما ينفد، بدون حذفه.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/orders" className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-bold text-neutral-900">الطلبات</Link>
              <button type="button" onClick={refresh} disabled={isRefreshing} className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
                <RefreshCw className={isRefreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> تحديث
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-neutral-50 p-4"><p className="text-xs font-semibold text-neutral-500">متوفر</p><p className="mt-1 text-2xl font-black">{availableCount}</p></div>
            <div className="rounded-2xl bg-neutral-50 p-4"><p className="text-xs font-semibold text-neutral-500">غير متوفر حاليًا</p><p className="mt-1 text-2xl font-black">{unavailableCount}</p></div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج أو قسم..." className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pr-11 pl-4 text-sm font-medium outline-none focus:border-neutral-400" />
          </div>
        </section>
        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm"><Package className="mx-auto h-9 w-9 text-neutral-300" /><p className="mt-3 font-bold">لا توجد منتجات</p></div>
          ) : filtered.map((product) => (
            <article key={product.id} className="rounded-3xl bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100"><Package className="h-5 w-5 text-neutral-500" /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-black">{product.name}</h2>
                  <p className="mt-1 truncate text-xs text-neutral-400">{product.category_name || "بدون قسم"} · {Number(product.price).toFixed(2)} د.ل</p>
                </div>
                <button type="button" onClick={() => toggle(product)} disabled={pendingId === product.id} className={["flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition disabled:opacity-50", product.is_available ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"].join(" ")}>
                  {pendingId === product.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : product.is_available ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {product.is_available ? "متوفر" : "غير متوفر"}
                </button>
              </div>
              {!product.is_available && <div className="mt-3 rounded-2xl bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-500">لن يظهر للزبائن في قائمة الطلب حاليًا.</div>}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
