"use client";

import { ChangeEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  ImagePlus,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Table2,
  Upload,
  X,
} from "lucide-react";

import {
  finalizePaymentProof,
  preparePaymentProofUpload,
  uploadPaymentProof,
} from "@/services/payment-proof";

import type { GuestOrder } from "@/services/guest-order-types";
import { loadGuestOrder } from "./actions";

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
    pending_verification: "جاري التحقق من الدفع",
    verified: "تم التحقق من الدفع",
    rejected: "تم رفض إثبات الدفع",
    paid: "تم الدفع",
    failed: "فشل الدفع",
  };

  return labels[status] ?? status;
}

function getOrderTypeLabel(type: GuestOrder["orderType"]) {
  const labels = {
    dine_in: "داخل المقهى",
    pickup: "استلام من المقهى",
    delivery: "توصيل",
  };

  return labels[type];
}

function getStatusIcon(status: string) {
  if (
    ["confirmed", "preparing", "ready", "completed"].includes(
      status,
    )
  ) {
    return (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    );
  }

  if (["cancelled", "rejected"].includes(status)) {
    return <X className="h-5 w-5 text-red-500" />;
  }

  return <Clock3 className="h-5 w-5 text-amber-500" />;
}

function OrderTrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const orderNumber = searchParams.get("order");

  async function loadOrder(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const orderId = localStorage.getItem(
        "lavaza-order-id",
      );

      const trackingToken = localStorage.getItem(
        "lavaza-order-token",
      );

      if (!orderId || !trackingToken) {
        throw new Error(
          "تعذر العثور على بيانات تتبع الطلب.",
        );
      }

   const data = await loadGuestOrder(
  orderId,
  trackingToken,
);
      setOrder(data);
    } catch (error) {
      console.error("Load order error:", error);

      if (error instanceof Error) {
        setUploadError(error.message);
      } else {
        setUploadError("تعذر تحميل الطلب.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");
    setUploadSuccess(false);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.",
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setUploadError(
        "حجم الصورة يجب ألا يتجاوز 5 ميجابايت.",
      );

      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError("");
    setUploadSuccess(false);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setUploadError("يرجى اختيار صورة إثبات الدفع أولاً.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess(false);

      const orderId = localStorage.getItem(
        "lavaza-order-id",
      );

      const trackingToken = localStorage.getItem(
        "lavaza-order-token",
      );

      if (!orderId || !trackingToken) {
        throw new Error(
          "تعذر العثور على بيانات تتبع الطلب.",
        );
      }

      const prepare =
        await preparePaymentProofUpload(
          orderId,
          trackingToken,
        );

      if (
        !prepare.storagePath ||
        !prepare.token
      ) {
        throw new Error(
          "تعذر تجهيز رفع إثبات الدفع.",
        );
      }

      await uploadPaymentProof(
        prepare.storagePath,
        prepare.token,
        selectedFile,
      );

      await finalizePaymentProof(
        orderId,
        trackingToken,
        prepare.storagePath,
      );

      setUploadSuccess(true);
      removeSelectedFile();

      await loadOrder(true);
    } catch (error) {
      console.error(
        "Payment proof upload error:",
        error,
      );

      setUploadError(
        error instanceof Error
          ? error.message
          : "تعذر رفع إثبات الدفع.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 px-4 py-10"
      >
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-neutral-800" />

            <p className="mt-4 text-sm text-neutral-500">
              جاري تحميل طلبك...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 px-4 py-10"
      >
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-neutral-400" />

            <h1 className="mt-4 text-xl font-bold">
              تعذر تحميل الطلب
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              {uploadError ||
                "تأكد من أن بيانات التتبع صحيحة."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/order")}
              className="mt-6 rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white"
            >
              العودة إلى القائمة
            </button>
          </div>
        </div>
      </main>
    );
  }

  const canUpload =
    order.paymentMethod === "bank_transfer" &&
    order.orderStatus === "awaiting_payment" &&
    ["pending", "rejected"].includes(
      order.paymentStatus,
    );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 px-4 py-6"
    >
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-xs text-neutral-500">
              تتبع الطلب
            </p>

            <h1 className="text-xl font-black text-neutral-900">
              #{order.orderNumber || orderNumber}
            </h1>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => loadOrder(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm"
          >
            <RefreshCw
              className={`h-5 w-5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </header>

        {/* Main status */}
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              {getStatusIcon(order.orderStatus)}
            </div>

            <h2 className="mt-4 text-2xl font-black text-neutral-900">
              {getOrderStatusLabel(
                order.orderStatus,
              )}
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              {order.paymentStatus ===
                "pending_verification"
                ? "تم استلام إثبات الدفع وسيتم التحقق منه."
                : "يمكنك متابعة حالة طلبك من هذه الصفحة."}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>استلام</span>
              <span>تأكيد</span>
              <span>تحضير</span>
              <span>جاهز</span>
              <span>مكتمل</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                style={{
                  width:
                    order.orderStatus === "pending" ||
                    order.orderStatus ===
                      "awaiting_payment"
                      ? "10%"
                      : order.orderStatus ===
                          "confirmed"
                        ? "35%"
                        : order.orderStatus ===
                            "preparing"
                          ? "55%"
                          : order.orderStatus ===
                              "ready"
                            ? "80%"
                            : order.orderStatus ===
                                "completed"
                              ? "100%"
                              : "10%",
                }}
              />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
              <CreditCard className="h-5 w-5" />
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

          {order.paymentRejectionReason && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              <p className="font-bold">
                تم رفض إثبات الدفع
              </p>

              <p className="mt-1">
                {order.paymentRejectionReason}
              </p>
            </div>
          )}

          {canUpload && (
            <div className="mt-5 border-t border-neutral-100 pt-5">
              <div>
                <h3 className="font-bold text-neutral-900">
                  رفع إثبات التحويل
                </h3>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  اختر صورة واضحة لإيصال التحويل البنكي.
                  الحد الأقصى لحجم الصورة 5 ميجابايت.
                </p>
              </div>

              {!selectedFile ? (
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center transition hover:border-neutral-400">
                  <ImagePlus className="h-9 w-9 text-neutral-400" />

                  <p className="mt-3 text-sm font-bold text-neutral-800">
                    اختر صورة الإثبات
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    JPG أو PNG أو WEBP
                  </p>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="معاينة إثبات الدفع"
                      className="max-h-80 w-full object-contain"
                    />
                  )}

                  <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={removeSelectedFile}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-500 shadow-sm"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                  تم رفع إثبات الدفع بنجاح.
                </div>
              )}

              {selectedFile && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleUpload}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جاري رفع الإثبات...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      إرسال إثبات الدفع
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {order.paymentStatus ===
            "pending_verification" && (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <p className="font-bold">
                إثبات الدفع قيد المراجعة
              </p>

              <p className="mt-1">
                تم استلام الإثبات. يرجى الانتظار حتى يتم
                التحقق من التحويل.
              </p>
            </div>
          )}
        </section>

        {/* Items */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">
            تفاصيل الطلب
          </h2>

          <div className="mt-3 divide-y divide-neutral-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {item.productName}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {item.quantity} ×{" "}
                    {item.unitPrice.toFixed(2)} د.ل
                  </p>
                </div>

                <p className="shrink-0 font-bold">
                  {item.subtotal.toFixed(2)} د.ل
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-sm text-neutral-500">
              الإجمالي
            </span>

            <span className="text-xl font-black">
              {order.total.toFixed(2)} د.ل
            </span>
          </div>

          {order.orderType === "delivery" && (
            <p className="mt-2 text-xs text-neutral-400">
              الإجمالي لا يشمل رسوم التوصيل.
            </p>
          )}
        </section>

        {/* Delivery / table */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">
            معلومات الاستلام
          </h2>

          <div className="mt-4 space-y-4">
            {order.orderType === "dine_in" &&
              order.tableNumber && (
                <div className="flex items-start gap-3">
                  <Table2 className="mt-0.5 h-5 w-5 text-neutral-400" />

                  <div>
                    <p className="text-xs text-neutral-500">
                      رقم الطاولة
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.tableNumber}
                    </p>
                  </div>
                </div>
              )}

            {order.orderType === "delivery" &&
              order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-neutral-400" />

                  <div>
                    <p className="text-xs text-neutral-500">
                      عنوان التوصيل
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.deliveryAddress}
                    </p>

                    {order.deliveryLocationNote && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {order.deliveryLocationNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 text-neutral-400" />

              <div>
                <p className="text-xs text-neutral-500">
                  طريقة الطلب
                </p>

                <p className="mt-1 font-semibold">
                  {getOrderTypeLabel(
                    order.orderType,
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">
            سجل حالة الطلب
          </h2>

          <div className="mt-5 space-y-5">
            {order.statusHistory
              .slice()
              .reverse()
              .map((history, index) => (
                <div
                  key={`${history.createdAt}-${index}`}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                      {getStatusIcon(
                        history.status,
                      )}
                    </div>

                    {index <
                      order.statusHistory.length -
                        1 && (
                      <div className="mt-2 h-full min-h-5 w-px bg-neutral-200" />
                    )}
                  </div>

                  <div className="pb-2">
                    <p className="font-semibold">
                      {getOrderStatusLabel(
                        history.status,
                      )}
                    </p>

                    {history.note && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {history.note}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-neutral-400">
                      {new Date(
                        history.createdAt,
                      ).toLocaleString("ar-LY")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => router.push("/order")}
          className="w-full pb-5 text-sm font-semibold text-neutral-500"
        >
          العودة إلى القائمة
        </button>
      </div>
    </main>
  );
}
export default function OrderTrackPage() {
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
      <OrderTrackContent />
    </Suspense>
  );
}