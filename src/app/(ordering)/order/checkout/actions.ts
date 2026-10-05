"use server";

import { createClient } from "@/services/supabase/server";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  branchId: string;
  orderType: "dine_in" | "pickup" | "delivery";
  paymentMethod: "bank_transfer" | "cash_on_delivery";
  customerNotes?: string;
  deliveryAddress?: string;
  deliveryLocationNote?: string;
  items: CheckoutItem[];
};

function generateTrackingToken() {
  return crypto.randomUUID() + crypto.randomUUID();
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data,
  );

  return Array.from(new Uint8Array(hash))
    .map((byte) =>
      byte.toString(16).padStart(2, "0"),
    )
    .join("");
}

export async function createGuestOrder(
  input: CreateOrderInput,
): Promise<
  | { ok: true; orderId: string; orderNumber: number; subtotal: number; total: number; paymentDeadline: string | null; trackingToken: string }
  | { ok: false; error: string }
> {
  if (!input.customerName.trim()) {
    return { ok: false, error: "الاسم مطلوب." };
  }

  if (!input.customerPhone.trim()) {
    return { ok: false, error: "رقم الهاتف مطلوب." };
  }

  if (!input.branchId) {
    return { ok: false, error: "الفرع مطلوب." };
  }

  if (!input.items.length) {
    return { ok: false, error: "السلة فارغة." };
  }

  if (
    input.orderType === "delivery" &&
    !input.deliveryAddress?.trim()
  ) {
    return { ok: false, error: "عنوان التوصيل مطلوب." };
  }

  const supabase = await createClient();

  const trackingToken = generateTrackingToken();
  const trackingTokenHash = await sha256(trackingToken);

  const { data, error } = await supabase.rpc(
    "create_guest_order",
    {
      p_customer_name: input.customerName.trim(),
      p_customer_phone: input.customerPhone.trim(),
      p_branch_id: input.branchId,
      p_order_type: input.orderType,
      p_payment_method: input.paymentMethod,
      p_tracking_token_hash: trackingTokenHash,
      p_items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      p_customer_notes:
        input.customerNotes?.trim() || null,
      p_table_number: null,
      p_delivery_address:
        input.orderType === "delivery"
          ? input.deliveryAddress?.trim() || null
          : null,
      p_delivery_location_note:
        input.orderType === "delivery"
          ? input.deliveryLocationNote?.trim() || null
          : null,
    },
  );

  if (error) {
    console.error("Create guest order error:", error);
    return {
      ok: false,
      error: error.message || "تعذر إنشاء الطلب.",
    };
  }

  const result = data?.[0];

  if (!result) {
    return { ok: false, error: "تعذر إنشاء الطلب." };
  }

  return {
    ok: true,
    orderId: result.order_id,
    orderNumber: Number(result.order_number),
    subtotal: Number(result.subtotal),
    total: Number(result.total),
    paymentDeadline:
      result.payment_deadline,
    trackingToken,
  };
}

export async function getActiveBranches() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_active_order_branches",
  );

  if (error) {
    console.error("Load active branches error:", error);
    throw new Error("تعذر تحميل الفروع المتاحة.");
  }

  return (data ?? []) as Array<{
    id: string;
    name: string;
    sort_order: number;
  }>;
}
