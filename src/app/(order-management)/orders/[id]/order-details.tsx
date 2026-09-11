
"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  User,
  Phone,
  MapPin,
  Utensils,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";

import {
  getPaymentProofUrl,
  verifyBankTransfer,
  rejectBankTransfer,
  updateOrderStatus,
} from "./actions";

type TimelineEvent = {
  id: string;
  type: "order" | "payment" | "proof";
  status: string;
  title: string;
  description?: string | null;
  createdAt: string;
};

type OrderDetailsProps = {
  order: any;
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  awaiting_payment: "بانتظار الدفع",
  confirmed: "تم التأكيد",
  preparing: "قيد التحضير",
  ready: "جاهز",
  completed: "مكتمل",
  cancelled: "ملغي",
  rejected: "مرفوض",
};

const orderTypeLabels: Record<string, string> = {
  dine_in: "داخل المقهى",
  pickup: "استلام",
  delivery: "توصيل",
};

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: "تحويل مصرفي",
  cash_on_delivery: "الدفع عند الاستلام",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "بانتظار الدفع",
  pending_verification: "بانتظار التحقق",
  verified: "تم التحقق",
  rejected: "مرفوض",
  paid: "مدفوع",
  failed: "فشل الدفع",
};

const orderProgressStatuses = [
  "confirmed",
  "preparing",
  "ready",
  "completed",
] as const;

type ProgressStatus =
  Exclude<
    (typeof orderProgressStatuses)[number],
    "confirmed"
  >;
function getOrderStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "تم إنشاء الطلب";

    case "awaiting_payment":
      return "بانتظار الدفع";

    case "confirmed":
      return "تم تأكيد الطلب";

    case "preparing":
      return "جاري التحضير";

    case "ready":
      return "الطلب جاهز";

    case "completed":
      return "تم إكمال الطلب";

    case "cancelled":
      return "تم إلغاء الطلب";

    case "rejected":
      return "تم رفض الطلب";

    default:
      return status;
  }
}

function getPaymentStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "بانتظار الدفع";

    case "pending_verification":
      return "تم رفع إثبات الدفع";

    case "verified":
      return "تم التحقق من التحويل المصرفي";

    case "rejected":
      return "تم رفض إثبات الدفع";

    case "paid":
      return "تم تسجيل الدفع";

    case "failed":
      return "فشل الدفع";

    default:
      return status;
  }
}

function getTimelineEventIcon(event: TimelineEvent) {
  if (event.type === "payment") {
    if (event.status === "rejected") {
      return (
        <XCircle
          size={17}
          className="text-red-400"
        />
      );
    }

    if (event.status === "pending_verification") {
      return (
        <Clock
          size={17}
          className="text-amber-300"
        />
      );
    }

    if (
      event.status === "verified" ||
      event.status === "paid"
    ) {
      return (
        <CheckCircle2
          size={17}
          className="text-green-400"
        />
      );
    }

    return (
      <CreditCard
        size={17}
        className="text-[#d4af37]"
      />
    );
  }

  if (event.type === "proof") {
    return (
      <ImageIcon
        size={17}
        className="text-[#d4af37]"
      />
    );
  }

  if (
    event.status === "cancelled" ||
    event.status === "rejected"
  ) {
    return (
      <XCircle
        size={17}
        className="text-red-400"
      />
    );
  }

  return (
    <CheckCircle2
      size={17}
      className="text-[#d4af37]"
    />
  );
}

function getTimelineEventIconBackground(
  event: TimelineEvent,
) {
  if (
    event.type === "payment" &&
    event.status === "rejected"
  ) {
    return "border-red-400/20 bg-red-400/10";
  }

  if (
    event.type === "payment" &&
    event.status === "pending_verification"
  ) {
    return "border-amber-400/20 bg-amber-400/10";
  }

  if (
    event.type === "payment" &&
    (event.status === "verified" ||
      event.status === "paid")
  ) {
    return "border-green-400/20 bg-green-400/10";
  }

  return "border-white/10 bg-white/5";
}

export default function OrderDetails({
  order,
}: OrderDetailsProps) {
  const router = useRouter();

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const history = Array.isArray(
    order.status_history,
  )
    ? order.status_history
    : [];

  const paymentHistory = Array.isArray(
    order.payment_status_history,
  )
    ? order.payment_status_history
    : [];

  const proofs = Array.isArray(order.proofs)
    ? order.proofs
    : [];

  const [proofUrl, setProofUrl] =
    useState<string | null>(null);

  const [proofLoading, setProofLoading] =
    useState(false);

  const [proofError, setProofError] =
    useState<string | null>(null);

  const [paymentActionLoading, setPaymentActionLoading] =
    useState(false);

  const [paymentActionError, setPaymentActionError] =
    useState<string | null>(null);

  const [showRejectForm, setShowRejectForm] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [statusActionLoading, setStatusActionLoading] =
    useState(false);

  const [statusActionError, setStatusActionError] =
    useState<string | null>(null);

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    const orderEvents: TimelineEvent[] =
      history.map((event: any) => ({
        id: `order-${event.id}`,
        type: "order",
        status: event.status,
        title: getOrderStatusLabel(event.status),
        description: event.note,
        createdAt: event.createdAt,
      }));

    const paymentEvents: TimelineEvent[] =
      paymentHistory.map((event: any) => ({
        id: `payment-${event.id}`,
        type: "payment",
        status: event.status,
        title: getPaymentStatusLabel(event.status),
        description: event.note,
        createdAt: event.createdAt,
      }));

    const proofEvents: TimelineEvent[] =
      proofs.map((proof: any, index: number) => ({
        id: `proof-${proof.id}`,
        type: "proof",
        status: "proof_uploaded",
        title: `تم رفع إثبات الدفع #${index + 1}`,
        description:
          "تم استلام صورة إثبات التحويل المصرفي.",
        createdAt:
          proof.uploadedAt ??
          proof.createdAt,
      }));

    return [
      ...orderEvents,
      ...paymentEvents,
      ...proofEvents,
    ].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );
  }, [history, paymentHistory, proofs]);

  async function openPaymentProof(
    storagePath: string,
  ) {
    try {
      setProofLoading(true);
      setProofError(null);

      const url =
        await getPaymentProofUrl(storagePath);

      setProofUrl(url);
    } catch (error) {
      console.error(
        "Open payment proof error:",
        error,
      );

      setProofError(
        error instanceof Error
          ? error.message
          : "تعذر فتح إثبات الدفع.",
      );
    } finally {
      setProofLoading(false);
    }
  }

  function closePaymentProof() {
    setProofUrl(null);
    setProofError(null);
  }

  async function handleVerifyPayment() {
    if (!order.id) {
      setPaymentActionError(
        "معرّف الطلب غير موجود.",
      );

      return;
    }

    if (!order.payment_id) {
      setPaymentActionError(
        "معرّف عملية الدفع غير موجود.",
      );

      return;
    }

    try {
      setPaymentActionLoading(true);
      setPaymentActionError(null);

      await verifyBankTransfer(
        order.id,
        order.payment_id,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Verify payment action error:",
        error,
      );

      setPaymentActionError(
        error instanceof Error
          ? error.message
          : "تعذر التحقق من الدفع.",
      );
    } finally {
      setPaymentActionLoading(false);
    }
  }

  async function handleRejectPayment() {
    if (!order.id) {
      setPaymentActionError(
        "معرّف الطلب غير موجود.",
      );

      return;
    }

    if (!order.payment_id) {
      setPaymentActionError(
        "معرّف عملية الدفع غير موجود.",
      );

      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      setPaymentActionError(
        "يجب إدخال سبب رفض الإثبات.",
      );

      return;
    }

    try {
      setPaymentActionLoading(true);
      setPaymentActionError(null);

      await rejectBankTransfer(
        order.id,
        order.payment_id,
        reason,
      );

      setRejectionReason("");
      setShowRejectForm(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Reject payment action error:",
        error,
      );

      setPaymentActionError(
        error instanceof Error
          ? error.message
          : "تعذر رفض إثبات الدفع.",
      );
    } finally {
      setPaymentActionLoading(false);
    }
  }

  async function handleOrderStatusChange(
    nextStatus: ProgressStatus,
  ) {
    if (!order.id) {
      setStatusActionError(
        "معرّف الطلب غير موجود.",
      );

      return;
    }

    try {
      setStatusActionLoading(true);
      setStatusActionError(null);

      await updateOrderStatus(
        order.id,
        nextStatus,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Order status update error:",
        error,
      );

      setStatusActionError(
        error instanceof Error
          ? error.message
          : "تعذر تحديث حالة الطلب.",
      );
    } finally {
      setStatusActionLoading(false);
    }
  }

  const canReviewPayment =
    order.payment_method ===
      "bank_transfer" &&
    order.payment_status ===
      "pending_verification";

  const currentProgressIndex =
    orderProgressStatuses.indexOf(
      order.order_status,
    );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#08111f] px-4 py-6 text-white"
    >
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/orders"
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-white/80
              transition
              hover:bg-white/10
            "
          >
            <ArrowRight size={18} />
            العودة للطلبات
          </Link>

          <div className="text-left">
            <p className="text-sm text-white/50">
              رقم الطلب
            </p>

            <h1 className="text-2xl font-bold">
              #{order.order_number}
            </h1>
          </div>
        </div>

        {/* Status */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-white/50">
                حالة الطلب
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-[#d4af37]/15 px-4 py-2 text-sm font-medium text-[#d4af37]">
                  {statusLabels[
                    order.order_status
                  ] ?? order.order_status}
                </span>

                <span className="text-sm text-white/50">
                  {orderTypeLabels[
                    order.order_type
                  ] ?? order.order_type}
                </span>
              </div>
            </div>

            <div className="text-right sm:text-left">
              <p className="text-sm text-white/50">
                تاريخ الطلب
              </p>

              <p className="mt-1 text-sm">
                {new Date(
                  order.created_at,
                ).toLocaleString("ar-LY")}
              </p>
            </div>

          </div>
        </section>

        {/* Order Progress Management */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

          <div className="mb-5 flex items-center gap-2">
            <Package
              size={20}
              className="text-[#d4af37]"
            />

            <div>
              <h2 className="text-lg font-bold">
                إدارة حالة الطلب
              </h2>

              <p className="mt-1 text-xs text-white/40">
                حدّث حالة الطلب حسب تقدّم التحضير.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-[520px] items-center">

              {orderProgressStatuses.map(
                (status, index) => {
                  const isActive =
                    order.order_status === status;

                  const isCompleted =
                    currentProgressIndex >= 0 &&
                    index < currentProgressIndex;

                  return (
                    <div
                      key={status}
                      className="flex flex-1 items-center"
                    >
                      <div className="flex flex-col items-center gap-2">

                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition",
                            isActive
                              ? "border-[#d4af37] bg-[#d4af37] text-black"
                              : isCompleted
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-white/10 bg-white/5 text-white/40",
                          ].join(" ")}
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              size={19}
                            />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <span
                          className={[
                            "whitespace-nowrap text-xs",
                            isActive
                              ? "font-bold text-[#d4af37]"
                              : isCompleted
                                ? "text-green-400"
                                : "text-white/40",
                          ].join(" ")}
                        >
                          {statusLabels[status]}
                        </span>

                      </div>

                      {index <
                        orderProgressStatuses.length -
                          1 && (
                        <div
                          className={[
                            "mx-2 h-px flex-1",
                            index <
                            currentProgressIndex
                              ? "bg-green-500/60"
                              : "bg-white/10",
                          ].join(" ")}
                        />
                      )}
                    </div>
                  );
                },
              )}

            </div>
          </div>

          {statusActionError && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4">
              <p className="text-sm text-red-300">
                {statusActionError}
              </p>
            </div>
          )}

          {/* Confirmed → Preparing */}
          {order.order_status ===
            "confirmed" && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  handleOrderStatusChange(
                    "preparing",
                  )
                }
                disabled={
                  statusActionLoading
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#d4af37]
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-black
                  transition
                  hover:bg-[#e2c15a]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Clock size={18} />

                {statusActionLoading
                  ? "جاري بدء التحضير..."
                  : "بدء التحضير"}
              </button>
            </div>
          )}

          {/* Preparing → Ready */}
          {order.order_status ===
            "preparing" && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  handleOrderStatusChange(
                    "ready",
                  )
                }
                disabled={
                  statusActionLoading
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#d4af37]
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-black
                  transition
                  hover:bg-[#e2c15a]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <CheckCircle2 size={18} />

                {statusActionLoading
                  ? "جاري تحديث الحالة..."
                  : "تحديد الطلب كجاهز"}
              </button>
            </div>
          )}

          {/* Ready → Completed */}
          {order.order_status ===
            "ready" && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  handleOrderStatusChange(
                    "completed",
                  )
                }
                disabled={
                  statusActionLoading
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-green-600
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-green-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <CheckCircle2 size={18} />

                {statusActionLoading
                  ? "جاري إكمال الطلب..."
                  : "تحديد الطلب كمكتمل"}
              </button>
            </div>
          )}

          {/* Completed */}
          {order.order_status ===
            "completed" && (
            <div className="mt-5 rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-center">
              <CheckCircle2
                size={22}
                className="mx-auto text-green-400"
              />

              <p className="mt-2 text-sm font-bold text-green-300">
                تم إكمال الطلب بنجاح.
              </p>

              <p className="mt-1 text-xs text-green-200/50">
                لا توجد إجراءات إضافية مطلوبة.
              </p>
            </div>
          )}

          {/* Other terminal states */}
          {(order.order_status ===
            "cancelled" ||
            order.order_status ===
              "rejected") && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-center">
              <XCircle
                size={22}
                className="mx-auto text-red-400"
              />

              <p className="mt-2 text-sm font-bold text-red-300">
                {order.order_status ===
                "cancelled"
                  ? "تم إلغاء الطلب."
                  : "تم رفض الطلب."}
              </p>

              <p className="mt-1 text-xs text-red-200/50">
                لا يمكن متابعة مراحل التحضير لهذا الطلب.
              </p>
            </div>
          )}

        </section>

        {/* Customer */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

          <div className="mb-5 flex items-center gap-2">
            <User
              size={20}
              className="text-[#d4af37]"
            />

            <h2 className="text-lg font-bold">
              بيانات العميل
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <InfoItem
              icon={<User size={17} />}
              label="الاسم"
              value={order.customer_name}
            />

            <InfoItem
              icon={<Phone size={17} />}
              label="رقم الهاتف"
              value={order.customer_phone}
            />

            {order.table_number && (
              <InfoItem
                icon={<Utensils size={17} />}
                label="رقم الطاولة"
                value={order.table_number}
              />
            )}

            {order.delivery_address && (
              <InfoItem
                icon={<MapPin size={17} />}
                label="عنوان التوصيل"
                value={order.delivery_address}
              />
            )}

            {order.delivery_location_note && (
              <InfoItem
                icon={<MapPin size={17} />}
                label="ملاحظة الموقع"
                value={
                  order.delivery_location_note
                }
              />
            )}

          </div>

          {order.customer_notes && (
            <div className="mt-4 rounded-xl bg-white/5 p-4">
              <p className="mb-1 text-xs text-white/40">
                ملاحظات العميل
              </p>

              <p className="text-sm text-white/80">
                {order.customer_notes}
              </p>
            </div>
          )}

        </section>

        {/* Items */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

          <div className="mb-5 flex items-center gap-2">
            <Package
              size={20}
              className="text-[#d4af37]"
            />

            <h2 className="text-lg font-bold">
              المنتجات
            </h2>
          </div>

          <div className="space-y-3">

            {items.length === 0 ? (
              <p className="rounded-xl bg-white/5 p-4 text-sm text-white/50">
                لا توجد منتجات في هذا الطلب.
              </p>
            ) : (
              items.map((item: any) => (
                <div
                  key={item.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-xl
                    bg-white/5
                    p-4
                  "
                >
                  <div>
                    <p className="font-medium">
                      {item.productName}
                    </p>

                    <p className="mt-1 text-xs text-white/50">
                      {item.quantity} ×{" "}
                      {Number(
                        item.unitPrice,
                      ).toFixed(2)}{" "}
                      د.ل
                    </p>
                  </div>

                  <p className="font-bold text-[#d4af37]">
                    {Number(
                      item.subtotal,
                    ).toFixed(2)}{" "}
                    د.ل
                  </p>
                </div>
              ))
            )}

          </div>

          <div className="mt-5 border-t border-white/10 pt-5">

            <div className="flex items-center justify-between">
              <span className="text-white/60">
                المجموع الفرعي
              </span>

              <span>
                {Number(
                  order.subtotal,
                ).toFixed(2)}{" "}
                د.ل
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-lg font-bold">
              <span>الإجمالي</span>

              <span className="text-[#d4af37]">
                {Number(
                  order.total,
                ).toFixed(2)}{" "}
                د.ل
              </span>
            </div>

          </div>

        </section>

        {/* Payment */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

          <div className="mb-5 flex items-center gap-2">
            <CreditCard
              size={20}
              className="text-[#d4af37]"
            />

            <h2 className="text-lg font-bold">
              الدفع
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <InfoItem
              icon={<CreditCard size={17} />}
              label="طريقة الدفع"
              value={
                paymentMethodLabels[
                  order.payment_method
                ] ?? order.payment_method
              }
            />

            <InfoItem
              icon={<Clock size={17} />}
              label="حالة الدفع"
              value={
                paymentStatusLabels[
                  order.payment_status
                ] ?? order.payment_status
              }
            />

          </div>

          {/* Payment deadline */}
          {order.payment_deadline && (
            <div className="mt-4 rounded-xl bg-white/5 p-4">
              <p className="text-xs text-white/40">
                الموعد النهائي للدفع
              </p>

              <p className="mt-1 text-sm">
                {new Date(
                  order.payment_deadline,
                ).toLocaleString("ar-LY")}
              </p>
            </div>
          )}

          {/* Rejection reason */}
          {order.payment_rejection_reason && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4">
              <div className="flex items-center gap-2">
                <XCircle
                  size={18}
                  className="text-red-400"
                />

                <p className="text-sm font-medium text-red-300">
                  سبب رفض إثبات الدفع
                </p>
              </div>

              <p className="mt-2 text-sm text-red-200/80">
                {order.payment_rejection_reason}
              </p>
            </div>
          )}

          {/* Payment proofs */}
          {order.payment_method ===
            "bank_transfer" && (
            <div className="mt-5 border-t border-white/10 pt-5">

              <div className="mb-4 flex items-center gap-2">
                <ImageIcon
                  size={19}
                  className="text-[#d4af37]"
                />

                <h3 className="font-semibold">
                  إثبات الدفع
                </h3>
              </div>

              {proofs.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-white/50">
                    لم يتم رفع إثبات دفع حتى الآن.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {proofs.map(
                    (
                      proof: any,
                      index: number,
                    ) => (
                      <div
                        key={
                          proof.id ??
                          proof.storagePath ??
                          index
                        }
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          rounded-xl
                          bg-white/5
                          p-4
                        "
                      >
                        <div>
                          <p className="text-sm font-medium">
                            إثبات الدفع #{index + 1}
                          </p>

                          {proof.uploadedAt && (
                            <p className="mt-1 text-xs text-white/40">
                              {new Date(
                                proof.uploadedAt,
                              ).toLocaleString(
                                "ar-LY",
                              )}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openPaymentProof(
                              proof.storagePath,
                            )
                          }
                          disabled={
                            proofLoading
                          }
                          className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#d4af37]
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-black
                            transition
                            hover:bg-[#e2c15a]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <ImageIcon
                            size={17}
                          />

                          {proofLoading
                            ? "جاري الفتح..."
                            : "عرض الإثبات"}
                        </button>
                      </div>
                    ),
                  )}

                </div>
              )}

              {proofError && (
                <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4">
                  <p className="text-sm text-red-300">
                    {proofError}
                  </p>
                </div>
              )}

              {/* Payment review */}
              {canReviewPayment && (
                <div className="mt-5 border-t border-white/10 pt-5">

                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                    <div className="flex items-start gap-3">
                      <Clock
                        size={20}
                        className="mt-0.5 shrink-0 text-amber-300"
                      />

                      <div>
                        <p className="text-sm font-bold text-amber-200">
                          الإثبات بانتظار المراجعة
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-100/70">
                          راجع صورة إثبات التحويل
                          وتأكد من أن المبلغ مطابق
                          لقيمة الطلب قبل اتخاذ القرار.
                        </p>
                      </div>
                    </div>
                  </div>

                  {paymentActionError && (
                    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4">
                      <p className="text-sm text-red-300">
                        {paymentActionError}
                      </p>
                    </div>
                  )}

                  {!showRejectForm ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                      {/* Accept */}
                      <button
                        type="button"
                        onClick={
                          handleVerifyPayment
                        }
                        disabled={
                          paymentActionLoading
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-green-600
                          px-4
                          py-3
                          text-sm
                          font-bold
                          text-white
                          transition
                          hover:bg-green-500
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <CheckCircle2
                          size={18}
                        />

                        {paymentActionLoading
                          ? "جاري المعالجة..."
                          : "قبول وتأكيد الدفع"}
                      </button>

                      {/* Reject */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentActionError(
                            null,
                          );

                          setShowRejectForm(
                            true,
                          );
                        }}
                        disabled={
                          paymentActionLoading
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-red-400/30
                          bg-red-400/10
                          px-4
                          py-3
                          text-sm
                          font-bold
                          text-red-300
                          transition
                          hover:bg-red-400/20
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <XCircle
                          size={18}
                        />

                        رفض الإثبات
                      </button>

                    </div>
                  ) : (
                    /* Reject form */
                    <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">

                      <div className="flex items-center gap-2">
                        <XCircle
                          size={19}
                          className="text-red-400"
                        />

                        <p className="text-sm font-bold text-red-200">
                          رفض إثبات الدفع
                        </p>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-white/50">
                        اكتب سبب الرفض ليتمكن العميل
                        من معرفة المشكلة وإعادة رفع
                        إثبات صحيح.
                      </p>

                      <textarea
                        value={
                          rejectionReason
                        }
                        onChange={(event) =>
                          setRejectionReason(
                            event.target.value,
                          )
                        }
                        placeholder="مثال: المبلغ المحول لا يطابق قيمة الطلب."
                        rows={4}
                        disabled={
                          paymentActionLoading
                        }
                        className="
                          mt-4
                          w-full
                          resize-none
                          rounded-xl
                          border
                          border-white/10
                          bg-black/20
                          px-4
                          py-3
                          text-sm
                          text-white
                          outline-none
                          transition
                          placeholder:text-white/30
                          focus:border-red-400/40
                          focus:ring-1
                          focus:ring-red-400/20
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      />

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">

                        <button
                          type="button"
                          onClick={
                            handleRejectPayment
                          }
                          disabled={
                            paymentActionLoading ||
                            !rejectionReason.trim()
                          }
                          className="
                            flex
                            flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-red-600
                            px-4
                            py-3
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-red-500
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <XCircle
                            size={18}
                          />

                          {paymentActionLoading
                            ? "جاري الرفض..."
                            : "تأكيد رفض الإثبات"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectForm(
                              false,
                            );

                            setRejectionReason(
                              "",
                            );

                            setPaymentActionError(
                              null,
                            );
                          }}
                          disabled={
                            paymentActionLoading
                          }
                          className="
                            rounded-xl
                            border
                            border-white/10
                            bg-white/5
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white/70
                            transition
                            hover:bg-white/10
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          إلغاء
                        </button>

                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </section>

        {/* Unified Timeline */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

          <div className="mb-6 flex items-center gap-2">
            <Clock
              size={20}
              className="text-[#d4af37]"
            />

            <div>
              <h2 className="text-lg font-bold">
                سجل الطلب
              </h2>

              <p className="mt-1 text-xs text-white/40">
                سجل موحّد لحالات الطلب والدفع وإثباتات التحويل.
              </p>
            </div>
          </div>

          {timelineEvents.length === 0 ? (
            <p className="rounded-xl bg-white/5 p-4 text-sm text-white/50">
              لا يوجد سجل لهذا الطلب.
            </p>
          ) : (
            <div className="space-y-0">

              {timelineEvents.map(
                (event, index) => {
                  const isLast =
                    index ===
                    timelineEvents.length - 1;

                  return (
                    <div
                      key={event.id}
                      className="relative flex gap-4"
                    >
                      {!isLast && (
                        <div
                          className="
                            absolute
                            right-[17px]
                            top-10
                            h-[calc(100%-8px)]
                            w-px
                            bg-white/10
                          "
                        />
                      )}

                      <div
                        className={[
                          "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                          getTimelineEventIconBackground(
                            event,
                          ),
                        ].join(" ")}
                      >
                        {getTimelineEventIcon(
                          event,
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-6">

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {event.title}
                            </p>

                            {event.type ===
                              "payment" && (
                              <span className="rounded-full bg-[#d4af37]/10 px-2 py-0.5 text-[10px] text-[#d4af37]">
                                دفع
                              </span>
                            )}

                            {event.type ===
                              "proof" && (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                                إثبات
                              </span>
                            )}
                          </div>

                          <time
                            dateTime={
                              event.createdAt
                            }
                            className="text-xs text-white/30"
                          >
                            {new Date(
                              event.createdAt,
                            ).toLocaleString(
                              "ar-LY",
                            )}
                          </time>
                        </div>

                        {event.description && (
                          <p className="mt-2 text-xs leading-5 text-white/45">
                            {event.description}
                          </p>
                        )}

                      </div>
                    </div>
                  );
                },
              )}

            </div>
          )}

        </section>

      </div>

      {/* Payment Proof Modal */}
      {proofUrl && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/80
            p-4
            backdrop-blur-sm
          "
          onClick={closePaymentProof}
        >
          <div
            className="
              relative
              max-h-[90vh]
              max-w-4xl
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-[#0b1728]
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={closePaymentProof}
              className="
                absolute
                left-3
                top-3
                z-10
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black/60
                text-white
                transition
                hover:bg-black/80
              "
              aria-label="إغلاق"
            >
              <XCircle size={22} />
            </button>

            <div className="flex max-h-[90vh] items-center justify-center p-3">
              <img
                src={proofUrl}
                alt="إثبات الدفع"
                className="
                  max-h-[85vh]
                  max-w-full
                  rounded-xl
                  object-contain
                "
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs text-white/40">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-2 text-sm font-medium text-white/90">
        {value || "—"}
      </p>
    </div>
  );
}
