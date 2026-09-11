"use server";

import { createClient } from "@/services/supabase/server";

const ORDER_ID = "8b6b3696-1ad2-4cec-8d71-157150c11c1f";
const PAYMENT_ID = "9b32735d-f256-4d84-8116-4020c962afae";
export async function rejectTestPayment() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("========== ORDER AUTH DEBUG ==========");
  console.log("Auth user id:", user?.id);
  console.log("Auth user email:", user?.email);
  console.log("User error:", userError);
  console.log("======================================");

  const { data: roleCheck, error: roleError } = await supabase.rpc(
    "has_order_role",
    {
      p_roles: ["staff", "manager", "owner"],
    }
  );

  console.log("========== ORDER ROLE DEBUG ==========");
  console.log("Role check:", roleCheck);
  console.log("Role error:", roleError);
  console.log("======================================");

  if (roleError) {
    throw new Error(roleError.message);
  }

  if (!roleCheck) {
    throw new Error(
      `Role check failed for auth user ${user?.id ?? "unknown"}`
    );
  }

  const { data, error } = await supabase.rpc(
    "reject_bank_transfer_payment",
    {
      p_order_id: ORDER_ID,
      p_payment_id: PAYMENT_ID,
      p_rejection_reason:
        "إثبات التحويل غير واضح، يرجى رفع صورة أوضح",
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export async function verifyTestPayment() {
  const supabase = await createClient();

  const { data: roleCheck, error: roleError } = await supabase.rpc(
    "has_order_role",
    {
      p_roles: ["staff", "manager", "owner"],
    }
  );

  if (roleError) {
    throw new Error(roleError.message);
  }

  if (!roleCheck) {
    throw new Error("You are not authorized to verify payments.");
  }

  const { data, error } = await supabase.rpc(
    "verify_bank_transfer_payment",
    {
      p_order_id: "8b6b3696-1ad2-4cec-8d71-157150c11c1f",
      p_payment_id: "9b32735d-f256-4d84-8116-4020c962afae",
      p_note: "تم التحقق من إثبات التحويل",
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}