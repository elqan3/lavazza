"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  Table2,
} from "lucide-react";

import {
  loadManagementOrders,
  updateManagementOrderStatus,
} from "./actions";

import type {
  ManagementOrder,
  OrderStatus,
} from "./types";

type Props = {
  initialOrders: ManagementOrder[];
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  awaiting_payment: "بانتظار الدفع",
  confirmed: "تم التأكيد",
  preparing: "جاري التحضير",
  ready: "جاهز",
  completed: "مكتمل",
  cancelled: "ملغى",
  rejected: "مرفوض",
};

const typeLabels = {
  dine_in: "داخل المقهى",
  pickup: "استلام",
  delivery: "توصيل",
};

const paymentLabels = {
  bank_transfer: "تحويل مصرفي",
  cash_on_delivery: "دفع عند الاستلام",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "ar-LY",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function getStatusClass(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";

    case "awaiting_payment":
      return "bg-orange-50 text-orange-700";

    case "confirmed":
      return "bg-blue-50 text-blue-700";

    case "preparing":
      return "bg-purple-50 text-purple-700";

    case "ready":
      return "bg-green-50 text-green-700";

    case "completed":
      return "bg-neutral-100 text-neutral-700";

    case "cancelled":
    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

export default function OrdersDashboard({
  initialOrders,
}: Props) {
  const [orders, setOrders] =
    useState<ManagementOrder[]>(initialOrders);

  const [status, setStatus] =
    useState<OrderStatus | "">("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [actionOrderId, setActionOrderId] =
    useState<string | null>(null);

  async function refresh() {
    setLoading(true);

    try {
      const data =
        await loadManagementOrders(
          status,
          search,
        );

      setOrders(data);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "تعذر تحديث الطلبات.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function advanceOrder(orderId: string, nextStatus: OrderStatus) {
    try {
      setActionOrderId(orderId);
      await updateManagementOrderStatus(orderId, nextStatus);
      await refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "تعذر تحديث حالة الطلب.");
    } finally {
      setActionOrderId(null);
    }
  }

  const operationalOrders = useMemo(
    () => orders.filter((order) => ["pending","awaiting_payment","confirmed","preparing","ready"].includes(order.order_status)),
    [orders],
  );

  const stats = useMemo(() => {
    return {
      total: orders.length,

      awaitingPayment:
        orders.filter(
          (order) =>
            order.order_status ===
            "awaiting_payment",
        ).length,

      pendingVerification:
        orders.filter(
          (order) =>
            order.payment_status ===
            "pending_verification",
        ).length,

      preparing:
        orders.filter(
          (order) =>
            order.order_status ===
            "preparing",
        ).length,
    };
  }, [orders]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 px-4 py-6 md:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-500">
                لافازا مود
              </p>

              <h1 className="mt-1 text-3xl font-black text-neutral-900">
                إدارة الطلبات
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                متابعة الطلبات والتحقق من المدفوعات.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/orders/products"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white"
              >
                <Package className="h-4 w-4" />
                إدارة المنتجات
              </Link>

              <Link
                href="/orders/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3 text-sm font-bold text-neutral-900"
              >
                الإحصائيات
              </Link>

              <Link
                href="/orders/branches"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3 text-sm font-bold text-neutral-900"
              >
                إدارة الفروع
              </Link>

              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}

                تحديث
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<ShoppingBag />}
            label="كل الطلبات"
            value={stats.total}
          />

          <StatCard
            icon={<Clock3 />}
            label="بانتظار الدفع"
            value={stats.awaitingPayment}
          />

          <StatCard
            icon={<CreditCard />}
            label="بانتظار التحقق"
            value={stats.pendingVerification}
          />

          <StatCard
            icon={<Package />}
            label="جاري التحضير"
            value={stats.preparing}
          />
        </section>

        {/* Today Operations */}
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3 px-1"><div><h2 className="text-xl font-black text-neutral-900">تشغيل اليوم</h2><p className="mt-1 text-sm text-neutral-500">الطلبات التي تحتاج متابعة الآن.</p></div><span className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white">{operationalOrders.length} نشط</span></div>
          {operationalOrders.length === 0 ? <div className="rounded-3xl bg-white p-8 text-center shadow-sm"><p className="font-bold text-neutral-900">لا توجد طلبات نشطة الآن</p><p className="mt-1 text-sm text-neutral-500">عندما يصل طلب جديد سيظهر هنا بعد التحديث.</p></div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <OperationColumn title="تحتاج إجراء" orders={operationalOrders.filter((o)=>o.order_status==="pending"||o.order_status==="awaiting_payment"||o.payment_status==="pending_verification")} actionOrderId={actionOrderId} onAdvance={advanceOrder}/>
            <OperationColumn title="تم التأكيد" orders={operationalOrders.filter((o)=>o.order_status==="confirmed")} actionOrderId={actionOrderId} onAdvance={advanceOrder}/>
            <OperationColumn title="جاري التحضير" orders={operationalOrders.filter((o)=>o.order_status==="preparing")} actionOrderId={actionOrderId} onAdvance={advanceOrder}/>
            <OperationColumn title="جاهز" orders={operationalOrders.filter((o)=>o.order_status==="ready")} actionOrderId={actionOrderId} onAdvance={advanceOrder}/>
          </div>}
        </section>

        {/* Filters */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    refresh();
                  }
                }}
                placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pr-11 pl-4 text-sm outline-none focus:border-neutral-400"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as OrderStatus | "",
                )
              }
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="">
                كل الحالات
              </option>

              {(
                Object.keys(
                  statusLabels,
                ) as OrderStatus[]
              ).map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {statusLabels[item]}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={refresh}
              className="rounded-2xl bg-neutral-100 px-5 py-3 text-sm font-bold text-neutral-900"
            >
              بحث
            </button>
          </div>
        </section>

        {/* Orders */}
        <section className="space-y-3">
          {orders.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <ShoppingBag className="mx-auto h-10 w-10 text-neutral-300" />

              <h2 className="mt-4 font-bold text-neutral-900">
                لا توجد طلبات
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                جرّب تغيير الفلتر أو البحث.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <OrderRow
                key={order.order_id}
                order={order}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function OperationColumn({title,orders,actionOrderId,onAdvance}:{title:string;orders:ManagementOrder[];actionOrderId:string|null;onAdvance:(orderId:string,nextStatus:OrderStatus)=>Promise<void>}) {
  return <div className="rounded-3xl bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="font-black text-neutral-900">{title}</h3><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600">{orders.length}</span></div><div className="space-y-2">
    {orders.length===0 ? <p className="rounded-2xl bg-neutral-50 p-4 text-center text-xs text-neutral-400">لا توجد طلبات</p> : orders.map((order)=>{
      const needsPaymentReview=order.payment_status==="pending_verification";
      const nextStatus=order.order_status==="pending"?"confirmed":order.order_status==="confirmed"?"preparing":order.order_status==="preparing"?"ready":order.order_status==="ready"?"completed":null;
      return <div key={order.order_id} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="font-black text-neutral-900">#{order.order_number}</p><p className="mt-0.5 truncate text-xs text-neutral-500">{order.customer_name} · {order.branch_name}</p></div><span className="shrink-0 text-sm font-black text-neutral-900">{order.total.toFixed(2)} د.ل</span></div>
      {needsPaymentReview&&<div className="mt-2 rounded-xl bg-orange-100 px-2.5 py-2 text-xs font-bold text-orange-800">إثبات تحويل يحتاج تحقق</div>}
      <div className="mt-2 flex gap-2"><Link href={`/orders/${order.order_id}`} className="flex-1 rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-neutral-700 ring-1 ring-neutral-200">التفاصيل</Link>
      {nextStatus&&!needsPaymentReview&&<button type="button" onClick={()=>onAdvance(order.order_id,nextStatus)} disabled={actionOrderId===order.order_id} className="flex-1 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{actionOrderId===order.order_id?"...":nextStatus==="confirmed"?"تأكيد":nextStatus==="preparing"?"بدء التحضير":nextStatus==="ready"?"جاهز":"إكمال"}</button>}</div></div>;
    })}
  </div></div>;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
        {icon}
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-neutral-900">
        {value}
      </p>
    </div>
  );
}

function OrderRow({
  order,
}: {
  order: ManagementOrder;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-black text-neutral-900">
              #{order.order_number}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                order.order_status,
              )}`}
            >
              {statusLabels[
                order.order_status
              ]}
            </span>

            {order.payment_status ===
              "pending_verification" && (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                إثبات يحتاج تحقق
              </span>
            )}
          </div>

          <p className="mt-2 font-bold text-neutral-900">
            {order.customer_name}
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            {order.customer_phone}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
          <Info
            label="الفرع"
            value={order.branch_name}
            icon={<Store />}
          />

          <Info
            label="النوع"
            value={typeLabels[order.order_type]}
            icon={
              order.order_type ===
              "delivery" ? (
                <MapPin />
              ) : (
                <Table2 />
              )
            }
          />

          <Info
            label="الدفع"
            value={
              paymentLabels[
                order.payment_method
              ]
            }
            icon={<CreditCard />}
          />

          <Info
            label="المجموع"
            value={`${order.total.toFixed(2)} د.ل`}
            icon={<ShoppingBag />}
          />

          <Info
            label="التاريخ"
            value={formatDate(
              order.created_at,
            )}
            icon={<Clock3 />}
          />
        </div>

        <Link
          href={`/orders/${order.order_id}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white"
        >
          <Eye className="h-4 w-4" />
          التفاصيل
        </Link>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-neutral-400">
        {icon}
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate font-semibold text-neutral-800">
        {value}
      </p>
    </div>
  );
}
