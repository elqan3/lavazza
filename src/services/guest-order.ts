import { createClient } from "@/services/supabase/server";


import type {
  GuestOrder,
  GuestOrderItem,
} from "@/services/guest-order-types";

export async function getGuestOrder(
  orderId: string,
  trackingToken: string,
): Promise<GuestOrder> {
  if (!orderId || !trackingToken) {
    throw new Error("بيانات تتبع الطلب غير مكتملة.");
  }

  const supabase = await createClient();

  const tokenData = new TextEncoder().encode(trackingToken);

  const tokenHashBuffer = await crypto.subtle.digest(
    "SHA-256",
    tokenData,
  );

  const trackingTokenHash = Array.from(
    new Uint8Array(tokenHashBuffer),
  )
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const { data, error } = await supabase.rpc(
    "get_guest_order",
    {
      p_order_id: orderId,
      p_tracking_token_hash: trackingTokenHash,
    },
  );

  if (error) {
    console.error("Get guest order error:", error);

    throw new Error(
      error.message || "تعذر تحميل بيانات الطلب.",
    );
  }

  const result = data?.[0];

  if (!result) {
    throw new Error(
      "الطلب غير موجود أو رمز التتبع غير صحيح.",
    );
  }

  return {
    orderId: result.order_id,
    orderNumber: Number(result.order_number),
    orderType: result.order_type,
    orderStatus: result.order_status,

    customerName: result.customer_name,
    customerPhone: result.customer_phone,
    customerNotes: result.customer_notes,

    tableNumber: result.table_number,
    deliveryAddress: result.delivery_address,
    deliveryLocationNote: result.delivery_location_note,

    subtotal: Number(result.subtotal),
    total: Number(result.total),

    createdAt: result.created_at,
    updatedAt: result.updated_at,
    paymentDeadline: result.payment_deadline,

    paymentMethod: result.payment_method,
    paymentStatus: result.payment_status,
    paymentRejectionReason:
      result.payment_rejection_reason,

    items: (result.items ?? []).map(
      (item: GuestOrderItem) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal),
      }),
    ),

    statusHistory: result.status_history ?? [],
  };
}