"use server";

import crypto from "node:crypto";
import { createClient } from "@/services/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function hashTrackingToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function preparePaymentProofUpload(
  orderId: string,
  trackingToken: string,
) {
  if (!orderId || !trackingToken) {
    return {
      success: false,
      error: "بيانات الطلب غير مكتملة.",
    };
  }

  const supabase = await createClient();

  const tokenHash = hashTrackingToken(trackingToken);

  const { data, error } = await supabase.rpc(
    "prepare_payment_proof_upload",
    {
      p_order_id: orderId,
      p_tracking_token_hash: tokenHash,
    },
  );

  if (error) {
    console.error("preparePaymentProofUpload:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  const result = data?.[0];

  if (!result) {
    return {
      success: false,
      error: "تعذر تجهيز رفع إثبات الدفع.",
    };
  }

  const { order_id, storage_path, payment_deadline } = result;

  const { data: signedUpload, error: uploadError } =
    await supabase.storage
      .from("payment-proofs")
      .createSignedUploadUrl(storage_path);

  if (uploadError || !signedUpload) {
    console.error("createSignedUploadUrl:", uploadError);

    return {
      success: false,
      error: "تعذر إنشاء رابط رفع آمن.",
    };
  }

  return {
    success: true,
    orderId: order_id,
    storagePath: storage_path,
    token: signedUpload.token,
    paymentDeadline: payment_deadline,
  };
}

export async function validatePaymentProofFile(file: File) {
  if (!file) {
    return {
      valid: false,
      error: "لم يتم اختيار صورة.",
    };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "حجم الصورة يجب ألا يتجاوز 5MB.",
    };
  }

  return {
    valid: true,
  };
}

export async function submitPaymentProof(
  orderId: string,
  trackingToken: string,
  storagePath: string,
) {
  if (!orderId || !trackingToken || !storagePath) {
    return {
      success: false,
      error: "بيانات إثبات الدفع غير مكتملة.",
    };
  }

  const supabase = await createClient();

  const tokenHash = hashTrackingToken(trackingToken);

  const { data, error } = await supabase.rpc(
    "submit_payment_proof",
    {
      p_order_id: orderId,
      p_tracking_token_hash: tokenHash,
      p_storage_path: storagePath,
    },
  );

  if (error) {
    console.error("submitPaymentProof:", error);

    // Remove orphaned upload if DB submission failed.
    await supabase.storage
      .from("payment-proofs")
      .remove([storagePath]);

    return {
      success: false,
      error: error.message,
    };
  }

  const result = data?.[0];

  if (!result) {
    await supabase.storage
      .from("payment-proofs")
      .remove([storagePath]);

    return {
      success: false,
      error: "تعذر تسجيل إثبات الدفع.",
    };
  }

  return {
    success: true,
    proofId: result.proof_id,
    paymentId: result.payment_id,
    orderId: result.order_id,
    paymentStatus: result.payment_status,
  };
}