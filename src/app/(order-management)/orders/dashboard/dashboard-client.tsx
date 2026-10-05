"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";

type DashboardData = {
  periodDays: number;
  kpis: {
    revenue: number | string;
    orders_count: number;
    completed_count: number;
    active_count: number;
    cancelled_count: number;
    average_order_value: number | string;
    today_orders: number;
    today_revenue: number | string;
  };
  daily: { day: string; date: string; orders: number; revenue: number | string }[];
  branches: { id: string; name: string; orders: number; completed_orders: number; revenue: number | string }[];
  orderTypes: { type: string; orders: number; revenue: number | string }[];
  payments: { method: string; orders: number; revenue: number | string }[];
  products: { id: string | null; name: string; quantity: number; revenue: number | string }[];
};

const typeLabels: Record<string,string> = { dine_in:"داخل المقهى", pickup:"استلام", delivery:"توصيل" };
const paymentLabels: Record<string,string> = { bank_transfer:"تحويل مصرفي", cash_on_delivery:"نقدي" };

const money = (v: number|string) => `${Number(v).toFixed(2)} د.ل`;

export default function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  async function refresh(nextDays = days) {
    setLoading(true);
    try {
      const res = await fetch("/api/order-dashboard?days=" + nextDays, { cache: "no-store" });
      if (!res.ok) throw new Error("تعذر تحديث الإحصائيات.");
      setData(await res.json());
    } catch (e) {
      alert(e instanceof Error ? e.message : "تعذر تحديث الإحصائيات.");
    } finally { setLoading(false); }
  }

  const maxRevenue = useMemo(() => Math.max(...data.daily.map(x => Number(x.revenue)), 1), [data.daily]);
  const maxProductQty = Math.max(...data.products.map(x => x.quantity), 1);

  return (
    <main dir="rtl" className="min-h-screen bg-neutral-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/orders" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900">
                <ArrowRight className="h-4 w-4" /> العودة للطلبات
              </Link>
              <p className="text-sm font-semibold text-neutral-500">لافازا مود</p>
              <h1 className="mt-1 text-3xl font-black text-neutral-900">لوحة الإحصائيات</h1>
              <p className="mt-2 text-sm text-neutral-500">صورة تشغيلية للمبيعات والطلبات والفروع خلال الفترة المحددة.</p>
            </div>
            <div className="flex gap-2">
              <select value={days} onChange={e => { const n=Number(e.target.value); setDays(n); refresh(n); }} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold">
                <option value="7">آخر 7 أيام</option><option value="30">آخر 30 يوم</option><option value="90">آخر 90 يوم</option>
              </select>
              <button onClick={() => refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> تحديث
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric icon={<WalletCards />} label="المبيعات المكتملة" value={money(data.kpis.revenue)} />
          <Metric icon={<ShoppingBag />} label="إجمالي الطلبات" value={data.kpis.orders_count} />
          <Metric icon={<Package />} label="طلبات نشطة" value={data.kpis.active_count} />
          <Metric icon={<CreditCard />} label="متوسط الطلب المكتمل" value={money(data.kpis.average_order_value)} />
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric icon={<BarChart3 />} label="طلبات اليوم" value={data.kpis.today_orders} />
          <Metric icon={<WalletCards />} label="مبيعات اليوم" value={money(data.kpis.today_revenue)} />
          <Metric icon={<Package />} label="مكتملة" value={data.kpis.completed_count} />
          <Metric icon={<Truck />} label="ملغاة / مرفوضة" value={data.kpis.cancelled_count} />
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-black text-neutral-900">المبيعات اليومية</h2>
            <p className="text-sm text-neutral-500">الإيراد الناتج عن الطلبات المكتملة فقط.</p>
          </div>
          <div className="flex h-64 items-end gap-1 overflow-x-auto pb-6">
            {data.daily.map(item => (
              <div key={item.date} className="flex h-full min-w-[28px] flex-1 flex-col justify-end">
                <div title={money(item.revenue)} className="w-full rounded-t-lg bg-neutral-900 transition hover:bg-neutral-700" style={{height:`${Math.max((Number(item.revenue)/maxRevenue)*100, Number(item.revenue)>0?5:1)}%`}} />
                <span className="mt-2 text-center text-[9px] text-neutral-400">{item.day}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-neutral-900">أداء الفروع</h2>
            <div className="mt-5 space-y-4">
              {data.branches.map(b => <div key={b.id}>
                <div className="flex justify-between gap-3 text-sm"><span className="font-bold">{b.name}</span><span className="font-black">{money(b.revenue)}</span></div>
                <div className="mt-2 flex justify-between text-xs text-neutral-500"><span>{b.orders} طلب</span><span>{b.completed_orders} مكتمل</span></div>
                <div className="mt-2 h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-neutral-900" style={{width:`${Math.min((Number(b.revenue)/Math.max(...data.branches.map(x=>Number(x.revenue)),1))*100,100)}%`}} /></div>
              </div>)}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-neutral-900">توزيع الطلبات</h2>
            <div className="mt-5 space-y-3">
              {data.orderTypes.map(x => <div key={x.type} className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4"><span className="font-bold">{typeLabels[x.type] ?? x.type}</span><div className="text-left"><b>{x.orders}</b><span className="mr-2 text-xs text-neutral-500">{money(x.revenue)}</span></div></div>)}
            </div>
            <h2 className="mt-7 text-lg font-black text-neutral-900">طرق الدفع</h2>
            <div className="mt-4 space-y-3">
              {data.payments.map(x => <div key={x.method} className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4"><span className="font-bold">{paymentLabels[x.method] ?? x.method}</span><div className="text-left"><b>{x.orders}</b><span className="mr-2 text-xs text-neutral-500">{money(x.revenue)}</span></div></div>)}
            </div>
          </section>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2"><Store className="h-5 w-5" /><div><h2 className="text-lg font-black text-neutral-900">الأكثر مبيعاً</h2><p className="text-sm text-neutral-500">حسب الكمية في الطلبات المكتملة.</p></div></div>
          <div className="space-y-3">
            {data.products.map((p,i) => <div key={p.id ?? p.name} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-2xl bg-neutral-50 p-3"><span className="text-sm font-black text-neutral-400">{i+1}</span><div><div className="font-bold">{p.name}</div><div className="mt-1 h-1.5 max-w-md rounded-full bg-neutral-200"><div className="h-1.5 rounded-full bg-neutral-900" style={{width:`${(p.quantity/maxProductQty)*100}%`}} /></div></div><div className="text-left"><b>{p.quantity}</b><div className="text-xs text-neutral-500">{money(p.revenue)}</div></div></div>)}
            {data.products.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">لا توجد مبيعات مكتملة في الفترة.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string|number}) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">{icon}</div><p className="mt-4 text-sm text-neutral-500">{label}</p><p className="mt-1 text-2xl font-black text-neutral-900">{value}</p></div>;
}
