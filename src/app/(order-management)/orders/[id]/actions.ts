"use server";

import { createClient } from "@/services/supabase/server";

export async function getPaymentProofUrl(storagePath: string) {
  if (!storagePath?.trim()) {
    throw new Error("مسار إثبات الدفع غير صالح.");
  }

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.error("Payment proof auth error:", claimsError);
    throw new Error("يجب تسجيل الدخول.");
  }

  const {
    data: hasRole,
    error: roleError,
  } = await supabase.rpc("has_order_role", {
    p_roles: ["staff", "manager", "owner"],
  });

  if (roleError) {
    console.error("Check order role error:", roleError);
    throw new Error("تعذر التحقق من صلاحيات المستخدم.");
  }

  if (!hasRole) {
    throw new Error("ليس لديك صلاحية مشاهدة إثبات الدفع.");
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(storagePath, 300);

  if (error || !data?.signedUrl) {
    console.error("Create payment proof URL error:", error);
    throw new Error("تعذر فتح إثبات الدفع.");
  }

  return data.signedUrl;
}

export async function verifyBankTransfer(
  orderId: string,
  paymentId: string,
) {
  if (!orderId?.trim()) {
    throw new Error("معرّف الطلب غير صالح.");
  }

  if (!paymentId?.trim()) {
    throw new Error("معرّف عملية الدفع غير صالح.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "verify_bank_transfer_payment",
    {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_note: "تم التحقق من التحويل المصرفي.",
    },
  );

  if (error) {
    console.error("Verify payment error:", error);
    throw new Error(error.message || "تعذر التحقق من الدفع.");
  }

  return data?.[0] ?? null;
}

export async function rejectBankTransfer(
  orderId: string,
  paymentId: string,
  reason: string,
) {
  if (!orderId?.trim()) {
    throw new Error("معرّف الطلب غير صالح.");
  }

  if (!paymentId?.trim()) {
    throw new Error("معرّف عملية الدفع غير صالح.");
  }

  if (!reason?.trim()) {
    throw new Error("يجب إدخال سبب رفض الإثبات.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "reject_bank_transfer_payment",
    {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_rejection_reason: reason.trim(),
    },
  );

  if (error) {
    console.error("Reject payment error:", error);
    throw new Error(error.message || "تعذر رفض إثبات الدفع.");
  }

  return data?.[0] ?? null;
}
export async function updateOrderStatus(
  orderId: string,
  status: "preparing" | "ready" | "completed",
  note?: string,
) {
  if (!orderId?.trim()) {
    throw new Error("معرّف الطلب غير صالح.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "update_order_status",
    {
      p_order_id: orderId,
      p_new_status: status,
      p_note: note?.trim() || null,
    },
  );

  if (error) {
    console.error("Update order status error:", error);
    throw new Error(
      error.message || "تعذر تحديث حالة الطلب.",
    );
  }

  return data?.[0] ?? null;
}