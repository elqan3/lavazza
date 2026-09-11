import { isAdmin } from "@/features/admin/api";
import { redirect } from "next/navigation";
import { rejectTestPayment, verifyTestPayment } from "./actions";

export default async function OrdersTestPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/mood-space");
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0f1d35] p-8 text-white"
    >
      <div className="mx-auto max-w-xl">

        <h1 className="text-2xl font-bold">
          اختبار نظام الطلبات
        </h1>

        <p className="mt-2 text-white/50">
          اختبار دورة الدفع البنكي
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#16284a] p-6">

          <p className="text-sm text-white/60">
            الطلب
          </p>

          <p className="mt-1 font-mono text-sm">
            #3
          </p>

          <p className="mt-5 text-sm text-white/60">
            حالة الدفع الحالية
          </p>

          <p className="mt-1 font-bold text-yellow-300">
            pending_verification
          </p>

          <div className="mt-8 grid gap-3">

            <form action={verifyTestPayment}>
              <button
                type="submit"
                className="
                  w-full
                  rounded-xl
                  bg-green-500
                  px-5
                  py-3
                  font-bold
                  text-white
                  transition
                  hover:bg-green-600
                  active:scale-[0.98]
                "
              >
                قبول إثبات التحويل
              </button>
            </form>

            <form action={rejectTestPayment}>
              <button
                type="submit"
                className="
                  w-full
                  rounded-xl
                  bg-red-500
                  px-5
                  py-3
                  font-bold
                  text-white
                  transition
                  hover:bg-red-600
                  active:scale-[0.98]
                "
              >
                رفض إثبات التحويل
              </button>
            </form>

          </div>

        </div>

      </div>
    </main>
  );
}