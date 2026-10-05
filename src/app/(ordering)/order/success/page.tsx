
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Check,
} from "lucide-react";

import { loadGuestOrder } from "./actions";
import type { GuestOrder } from "@/services/guest-order-types";

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    awaiting_payment: "بانتظار الدفع",
    confirmed: "تم تأكيد الطلب",
    preparing: "جاري التحضير",
    ready: "الطلب جاهز",
    completed: "تم إكمال الطلب",
    cancelled: "تم إلغاء الطلب",
    rejected: "تم رفض الطلب",
  };

  return labels[status] ?? status;
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "بانتظار الدفع",
    pending_verification: "جاري التحقق",
    verified: "تم التحقق",
    rejected: "تم رفض الإثبات",
    paid: "تم الدفع",
    failed: "فشل الدفع",
  };

  return labels[status] ?? status;
}

function getOrderTypeLabel(
  type: GuestOrder["orderType"],
) {
  const labels = {
    dine_in: "داخل المقهى",
    pickup: "استلام من المقهى",
    delivery: "توصيل",
  };

  return labels[type];
}

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] =
    useState<GuestOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copiedAccount, setCopiedAccount] =
    useState<string | null>(null);

  const orderNumber =
    searchParams.get("order");

  useEffect(() => {
    async function loadOrder() {
      try {
        const orderId =
          localStorage.getItem(
            "lavaza-order-id",
          );

        const trackingToken =
          localStorage.getItem(
            "lavaza-order-token",
          );

        if (!orderId || !trackingToken) {
          throw new Error(
            "تعذر العثور على بيانات تتبع الطلب.",
          );
        }

        const data =
          await loadGuestOrder(
            orderId,
            trackingToken,
          );

        setOrder(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "تعذر تحميل الطلب.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, []);

  async function copyAccount(
    accountNumber: string,
    accountName: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        accountNumber,
      );

      setCopiedAccount(accountName);

      setTimeout(() => {
        setCopiedAccount(null);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy account error:",
        error,
      );
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 px-4 py-10"
      >
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-neutral-700" />

            <p className="mt-4 text-sm text-neutral-500">
              جاري تحميل طلبك...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 px-4 py-10"
      >
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Package className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-neutral-900">
              تعذر تحميل الطلب
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              {error ||
                "حدث خطأ أثناء تحميل بيانات الطلب."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/order")
              }
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
            >
              العودة إلى القائمة
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  const canUploadPaymentProof =
    order.paymentMethod ===
      "bank_transfer" &&
    ["pending", "rejected"].includes(
      order.paymentStatus,
    ) &&
    order.orderStatus ===
      "awaiting_payment";

  const showBankTransfer =
    order.paymentMethod ===
      "bank_transfer" &&
    order.orderStatus ===
      "awaiting_payment";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 px-4 py-8"
    >
      <div className="mx-auto max-w-2xl space-y-5">

        {/* Success header */}
        <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-neutral-900">
            تم استلام طلبك
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            شكراً لطلبك من لافازا مود
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-800">
            الطلب #
            {order.orderNumber ||
              orderNumber}
          </div>
        </section>

        {/* Status */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                <Clock3 className="h-5 w-5 text-neutral-700" />
              </div>

              <div>
                <p className="text-xs text-neutral-500">
                  حالة الطلب
                </p>

                <p className="mt-1 font-bold text-neutral-900">
                  {getOrderStatusLabel(
                    order.orderStatus,
                  )}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold">
              {getOrderTypeLabel(
                order.orderType,
              )}
            </span>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
              <CreditCard className="h-5 w-5 text-neutral-700" />
            </div>

            <div>
              <p className="text-xs text-neutral-500">
                حالة الدفع
              </p>

              <p className="mt-1 font-bold text-neutral-900">
                {getPaymentStatusLabel(
                  order.paymentStatus,
                )}
              </p>
            </div>
          </div>

          {/* Bank transfer accounts */}
          {showBankTransfer && (
            <div className="mt-5 rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="mb-4">
                <h3 className="font-bold text-neutral-900">
                  بيانات التحويل المصرفي
                </h3>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  يرجى تحويل قيمة الطلب إلى أحد
                  الحسابين التاليين، ثم رفع صورة
                  واضحة لإثبات التحويل.
                </p>
              </div>

              {/* Bank of North Africa */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-neutral-500">
                      المصرف
                    </p>

                    <p className="mt-1 font-bold text-neutral-900">
                      مصرف شمال أفريقيا
                    </p>
                  </div>

                  <CreditCard className="h-5 w-5 text-neutral-500" />
                </div>

                <div className="mt-4">
                  <p className="text-xs text-neutral-500">
                    رقم الحساب
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <code
                      dir="ltr"
                      className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-neutral-100 px-3 py-3 text-left text-sm font-bold tracking-wide text-neutral-900"
                    >
                      LY24007021021011121081015
                    </code>

                    <button
                      type="button"
                      onClick={() =>
                        copyAccount(
                          "LY24007021021011121081015",
                          "north-africa",
                        )
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-800"
                      aria-label="نسخ رقم حساب مصرف شمال أفريقيا"
                    >
                      {copiedAccount ===
                      "north-africa" ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {copiedAccount ===
                    "north-africa" && (
                    <p className="mt-2 text-xs font-semibold text-green-600">
                      تم نسخ رقم الحساب
                    </p>
                  )}
                </div>
              </div>

              {/* Jumhouria Bank */}
              <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-neutral-500">
                      المصرف
                    </p>

                    <p className="mt-1 font-bold text-neutral-900">
                      مصرف الجمهورية
                    </p>
                  </div>

                  <CreditCard className="h-5 w-5 text-neutral-500" />
                </div>

                <div className="mt-4">
                  <p className="text-xs text-neutral-500">
                    رقم الحساب
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <code
                      dir="ltr"
                      className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-neutral-100 px-3 py-3 text-left text-sm font-bold tracking-wide text-neutral-900"
                    >
                      LY555666999888777444000000
                    </code>

                    <button
                      type="button"
                      onClick={() =>
                        copyAccount(
                          "LY555666999888777444000000",
                          "jumhouria",
                        )
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-800"
                      aria-label="نسخ رقم حساب مصرف الجمهورية"
                    >
                      {copiedAccount ===
                      "jumhouria" ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {copiedAccount ===
                    "jumhouria" && (
                    <p className="mt-2 text-xs font-semibold text-green-600">
                      تم نسخ رقم الحساب
                    </p>
                  )}
                </div>
              </div>

              {/* Payment amount */}
              <div className="mt-4 rounded-2xl bg-neutral-900 p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/70">
                    المبلغ المطلوب تحويله
                  </span>

                  <span className="text-xl font-black">
                    {order.total.toFixed(2)} د.ل
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold leading-5 text-amber-800">
                  بعد إتمام التحويل، احتفظ بصورة
                  واضحة من إيصال التحويل وارفعها
                  من خلال زر «رفع إثبات الدفع».
                </p>
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {order.paymentRejectionReason && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">
                سبب رفض الإثبات:
              </p>

              <p className="mt-1">
                {order.paymentRejectionReason}
              </p>
            </div>
          )}

          {/* Upload proof */}
          {canUploadPaymentProof && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/order/track?order=${order.orderNumber}`,
                )
              }
              className="mt-4 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              رفع إثبات الدفع
            </button>
          )}
        </section>

        {/* Items */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900">
            تفاصيل الطلب
          </h2>

          <div className="mt-4 divide-y divide-neutral-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-semibold text-neutral-900">
                    {item.productName}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    {item.quantity} ×{" "}
                    {item.unitPrice.toFixed(2)} د.ل
                  </p>
                </div>

                <p className="font-bold text-neutral-900">
                  {item.subtotal.toFixed(2)} د.ل
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                المجموع
              </span>

              <span className="text-xl font-black text-neutral-900">
                {order.total.toFixed(2)} د.ل
              </span>
            </div>

            {order.orderType ===
              "delivery" && (
              <p className="mt-2 text-xs text-neutral-400">
                ملاحظة: المجموع لا يشمل رسوم
                التوصيل. يتم تحديد رسوم التوصيل
                بشكل منفصل.
              </p>
            )}
          </div>
        </section>

        {/* Order information */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900">
            معلومات الطلب
          </h2>

          <div className="mt-4 space-y-4">
            {order.orderType ===
              "delivery" &&
              order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-neutral-500" />

                  <div>
                    <p className="text-xs text-neutral-500">
                      عنوان التوصيل
                    </p>

                    <p className="font-semibold">
                      {order.deliveryAddress}
                    </p>

                    {order.deliveryLocationNote && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {
                          order.deliveryLocationNote
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* Track */}
        <button
          type="button"
          onClick={() =>
            router.push(
              `/order/track?order=${order.orderNumber}`,
            )
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-neutral-900 shadow-sm"
        >
          تتبع الطلب
          <ArrowLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/order")
          }
          className="w-full pb-4 text-sm font-semibold text-neutral-500"
        >
          العودة إلى القائمة
        </button>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          dir="rtl"
          className="min-h-screen bg-neutral-50 px-4 py-10"
        >
          <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-neutral-700" />

              <p className="mt-4 text-sm text-neutral-500">
                جاري تحميل الطلب...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
