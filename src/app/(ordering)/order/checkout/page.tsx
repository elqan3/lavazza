"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronLeft,
  Loader2,
  MapPin,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createGuestOrder, getActiveBranches } from "./actions";

type CartItem = {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
  quantity: number;
};

type OrderType =
  | "dine_in"
  | "pickup"
  | "delivery";

type PaymentMethod =
  | "bank_transfer"
  | "cash_on_delivery";

type Branch = {
  id: string;
  name: string;
  sort_order: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ar-LY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [orderType, setOrderType] =
    useState<OrderType>("dine_in");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash_on_delivery");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchId, setBranchId] = useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [tableNumber, setTableNumber] =
    useState("");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [deliveryLocationNote, setDeliveryLocationNote] =
    useState("");

  const [customerNotes, setCustomerNotes] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("lavaza-order-cart");

      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoaded(true);
    }

    getActiveBranches()
      .then((data) => setBranches(data))
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل الفروع المتاحة.");
      })
      .finally(() => setBranchesLoading(false));
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.product.price) *
            item.quantity,
        0,
      ),
    [cart],
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!cart.length) {
      setError("السلة فارغة.");
      return;
    }

    if (!customerName.trim()) {
      setError("اكتب اسمك من فضلك.");
      return;
    }

    if (!customerPhone.trim()) {
      setError("اكتب رقم هاتفك.");
      return;
    }

    if (!branchId) {
      setError("اختر الفرع من فضلك.");
      return;
    }

    if (
      orderType === "dine_in" &&
      !tableNumber.trim()
    ) {
      setError("أدخل رقم الطاولة.");
      return;
    }

    if (
      orderType === "delivery" &&
      !deliveryAddress.trim()
    ) {
      setError("أدخل عنوان التوصيل.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await createGuestOrder({
        customerName,
        customerPhone,
        branchId,
        orderType,
        paymentMethod,
        customerNotes,
        tableNumber,
        deliveryAddress,
        deliveryLocationNote,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      localStorage.setItem(
        "lavaza-order-token",
        result.trackingToken,
      );

      localStorage.setItem(
        "lavaza-order-id",
        result.orderId,
      );

      localStorage.removeItem(
        "lavaza-order-cart",
      );

      router.push(
        `/order/success?order=${result.orderNumber}`,
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "تعذر إنشاء الطلب.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#faf9f6]"
      >
        <Loader2
          className="animate-spin text-neutral-400"
          size={28}
        />
      </main>
    );
  }

  if (!cart.length) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#faf9f6] px-4"
      >
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
            <ShoppingBag
              size={32}
              className="text-neutral-300"
            />
          </div>

          <h1 className="text-2xl font-black">
            السلة فارغة
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            أضف المنتجات التي تريدها أولاً.
          </p>

          <button
            type="button"
            onClick={() => router.push("/order")}
            className="mt-6 flex h-12 items-center gap-2 rounded-2xl bg-neutral-900 px-6 text-sm font-black text-white"
          >
            العودة للقائمة
            <ArrowRight size={17} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#faf9f6]"
    >
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#faf9f6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-3xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.push("/order")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <Image
              src="/logo.png"
              alt="Lavaza Mod"
              fill
              className="object-contain p-1"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-neutral-400">
              LAVAZA MOD
            </p>
            <h1 className="text-lg font-black">
              إتمام الطلب
            </h1>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl px-4 pb-16 pt-6"
      >
        {/* Order type */}
        <section>
          <SectionTitle
            number="01"
            title="كيف تريد استلام طلبك؟"
          />

          <div className="grid grid-cols-3 gap-2">
            <OrderTypeCard
              active={orderType === "dine_in"}
              icon={<Store size={20} />}
              title="داخل المقهى"
              subtitle="أنت داخل لافازا"
              onClick={() =>
                setOrderType("dine_in")
              }
            />

            <OrderTypeCard
              active={orderType === "pickup"}
              icon={<ShoppingBag size={20} />}
              title="استلام"
              subtitle="سأستلمه بنفسي"
              onClick={() =>
                setOrderType("pickup")
              }
            />

            <OrderTypeCard
              active={orderType === "delivery"}
              icon={<Truck size={20} />}
              title="توصيل"
              subtitle="إلى موقعي"
              onClick={() =>
                setOrderType("delivery")
              }
            />
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle
            number="02"
            title="اختر الفرع"
          />

          {branchesLoading ? (
            <div className="flex h-24 items-center justify-center rounded-2xl bg-white ring-1 ring-black/5">
              <Loader2 size={20} className="animate-spin text-neutral-400" />
            </div>
          ) : branches.length === 0 ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
              لا توجد فروع متاحة للطلب حاليًا.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setBranchId(branch.id)}
                  className={`relative rounded-2xl p-4 text-right transition ${
                    branchId === branch.id
                      ? "bg-neutral-900 text-white shadow-lg"
                      : "bg-white text-neutral-900 ring-1 ring-black/5 hover:ring-black/10"
                  }`}
                >
                  {branchId === branch.id && (
                    <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#d6a756] text-white">
                      <Check size={12} />
                    </span>
                  )}

                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                    branchId === branch.id ? "bg-white/10" : "bg-neutral-100"
                  }`}>
                    <Store size={20} />
                  </div>

                  <p className="text-sm font-black">{branch.name}</p>
                  <p className={`mt-1 text-[10px] ${
                    branchId === branch.id ? "text-white/50" : "text-neutral-400"
                  }`}>الفرع الذي سيجهز طلبك</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Conditional location */}
        {orderType === "dine_in" && (
          <section className="mt-8">
            <SectionTitle
              number="03"
              title="رقم الطاولة"
            />

            <input
              value={tableNumber}
              onChange={(e) =>
                setTableNumber(e.target.value)
              }
              placeholder="مثلاً: 12"
              className="h-14 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm font-bold outline-none transition focus:border-[#d6a756]/50 focus:ring-4 focus:ring-[#d6a756]/10"
            />
          </section>
        )}

        {orderType === "delivery" && (
          <section className="mt-8">
            <SectionTitle
              number="03"
              title="معلومات التوصيل"
            />

            <div className="space-y-3">
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute right-4 top-4 text-neutral-400"
                />

                <textarea
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(
                      e.target.value,
                    )
                  }
                  placeholder="عنوان التوصيل"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-black/5 bg-white px-4 py-4 pr-11 text-sm font-medium outline-none transition focus:border-[#d6a756]/50 focus:ring-4 focus:ring-[#d6a756]/10"
                />
              </div>

              <input
                value={deliveryLocationNote}
                onChange={(e) =>
                  setDeliveryLocationNote(
                    e.target.value,
                  )
                }
                placeholder="ملاحظة للموقع (اختياري)"
                className="h-14 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#d6a756]/50 focus:ring-4 focus:ring-[#d6a756]/10"
              />

              <div className="rounded-2xl bg-[#f3ead8] p-4 text-xs font-medium leading-6 text-[#765d32]">
                رسوم التوصيل غير مشمولة في المبلغ
                الظاهر أدناه، ويتم تحديدها بشكل منفصل
                حسب موقعك.
              </div>
            </div>
          </section>
        )}

        {/* Customer */}
        <section className="mt-8">
          <SectionTitle
            number="04"
            title="بياناتك"
          />

          <div className="space-y-3">
            <input
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              placeholder="الاسم"
              className="h-14 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm font-bold outline-none transition focus:border-[#d6a756]/50 focus:ring-4 focus:ring-[#d6a756]/10"
            />

            <input
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value)
              }
              placeholder="رقم الهاتف"
              inputMode="tel"
              className="h-14 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm font-bold outline-none transition focus:border-[#d6a756]/50 focus:ring-4 focus:ring-[#d6a756]/10"
            />

            <textarea
              value={customerNotes}
              onChange={(e) =>
                setCustomerNotes(e.target.value)
              }
              placeholder="ملاحظات على الطلب (اختياري)"
              rows={3}
              className="w-full resize-none rounded-2xl border border-black/5 bg-white px-4 py-4 text-sm font-medium outline-none transition focus:border-[#d6a756]/50 focus:ring-4 focus:ring-[#d6a756]/10"
            />
          </div>
        </section>

        {/* Payment */}
        <section className="mt-8">
          <SectionTitle
            number="05"
            title="طريقة الدفع"
          />

          <div className="space-y-3">
            <PaymentCard
              active={
                paymentMethod ===
                "cash_on_delivery"
              }
              icon={<Banknote size={21} />}
              title="الدفع نقدًا"
              subtitle={
                orderType === "dine_in"
                  ? "الدفع عند استلام الطلب"
                  : "الدفع عند الاستلام"
              }
              onClick={() =>
                setPaymentMethod(
                  "cash_on_delivery",
                )
              }
            />

            <PaymentCard
              active={
                paymentMethod ===
                "bank_transfer"
              }
              icon={<Wallet size={21} />}
              title="تحويل مصرفي"
              subtitle="إرفاق إثبات التحويل بعد الطلب"
              onClick={() =>
                setPaymentMethod(
                  "bank_transfer",
                )
              }
            />
          </div>
        </section>

        {/* Summary */}
        <section className="mt-8">
          <SectionTitle
            number="06"
            title="مراجعة الطلب"
          />

          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
            <div className="divide-y divide-black/5">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src="/logo.png"
                        alt=""
                        fill
                        className="object-contain p-2 opacity-20 grayscale"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black">
                      {item.product.name}
                    </p>

                    <p className="mt-1 text-xs font-bold text-neutral-400">
                      × {item.quantity}
                    </p>
                  </div>

                  <span className="text-sm font-black">
                    {formatPrice(
                      item.product.price *
                        item.quantity,
                    )}{" "}
                    <span className="text-[10px] text-neutral-400">
                      د.ل
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-black/5 bg-neutral-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-500">
                  الإجمالي
                </span>

                <span className="text-2xl font-black">
                  {formatPrice(subtotal)}{" "}
                  <span className="text-xs text-neutral-400">
                    د.ل
                  </span>
                </span>
              </div>

              {orderType === "delivery" && (
                <p className="mt-2 text-[11px] leading-5 text-neutral-400">
                  لا يشمل الإجمالي رسوم التوصيل.
                </p>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-6 text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
         className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-neutral-900 px-5 text-sm font-black text-white shadow-xl shadow-black/10 transition hover:bg-[#b88934] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2
                size={19}
                className="animate-spin"
              />
              جاري إنشاء طلبك...
            </>
          ) : (
            <>
              تأكيد الطلب
              <Check size={19} />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-[11px] leading-5 text-neutral-400">
          بتأكيد الطلب أنت توافق على إرسال بيانات
          الطلب إلى لافازا مود لمعالجته.
        </p>
      </form>
    </main>
  );
}

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-xs font-black text-[#b88934]">
        {number}
      </span>

      <h2 className="text-xl font-black">
        {title}
      </h2>
    </div>
  );
}

function OrderTypeCard({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl p-4 text-right transition ${
        active
          ? "bg-neutral-900 text-white shadow-lg"
          : "bg-white text-neutral-900 ring-1 ring-black/5 hover:ring-black/10"
      }`}
    >
      {active && (
        <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#d6a756] text-white">
          <Check size={12} />
        </span>
      )}

      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? "bg-white/10"
            : "bg-neutral-100"
        }`}
      >
        {icon}
      </div>

      <p className="text-sm font-black">
        {title}
      </p>

      <p
        className={`mt-1 text-[10px] leading-4 ${
          active
            ? "text-white/50"
            : "text-neutral-400"
        }`}
      >
        {subtitle}
      </p>
    </button>
  );
}

function PaymentCard({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl p-4 text-right transition ${
        active
          ? "bg-neutral-900 text-white shadow-lg"
          : "bg-white text-neutral-900 ring-1 ring-black/5"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-white/10"
            : "bg-neutral-100"
        }`}
      >
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-black">
          {title}
        </p>

        <p
          className={`mt-1 text-xs ${
            active
              ? "text-white/50"
              : "text-neutral-400"
          }`}
        >
          {subtitle}
        </p>
      </div>

      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
          active
            ? "border-[#d6a756] bg-[#d6a756]"
            : "border-neutral-200"
        }`}
      >
        {active && <Check size={14} />}
      </div>
    </button>
  );
}