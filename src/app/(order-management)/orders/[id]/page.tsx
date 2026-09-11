
import { notFound } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import OrderDetails from "./order-details";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_order_management_order",
    {
      p_order_id: id,
    },
  );

  if (error) {
    console.error(
      "Load order details error:",
      error,
    );

    throw new Error(
      error.message || "تعذر تحميل تفاصيل الطلب.",
    );
  }

  if (!data?.order) {
    notFound();
  }

  const order = {
    id: data.order.id,
    order_number: Number(data.order.orderNumber),
    order_type: data.order.orderType,
    order_status: data.order.status,

    customer_name: data.order.customerName,
    customer_phone: data.order.customerPhone,
    customer_notes: data.order.customerNotes,

    table_number: data.order.tableNumber,
    delivery_address: data.order.deliveryAddress,
    delivery_location_note:
      data.order.deliveryLocationNote,

    subtotal: Number(data.order.subtotal),
    total: Number(data.order.total),

    expires_at: data.order.expiresAt,
    payment_deadline:
      data.order.paymentDeadline,

    created_at: data.order.createdAt,
    updated_at: data.order.updatedAt,

    payment_method: data.payment?.method,
    payment_status: data.payment?.status,
    payment_id: data.payment?.id,
    payment_verified_by:
      data.payment?.verifiedBy,
    payment_verified_at:
      data.payment?.verifiedAt,
    payment_rejection_reason:
      data.payment?.rejectionReason,

    items: (data.items ?? []).map(
      (item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal),
      }),
    ),

    proofs: data.proofs ?? [],

    status_history: (data.statusHistory ?? []).map((entry: any) => ({
  id: entry.id,
  oldStatus: entry.oldStatus,
  status: entry.newStatus,
  changedBy: entry.changedBy,
  note: entry.note,
  createdAt: entry.createdAt,
})),

payment_status_history: (data.paymentStatusHistory ?? []).map(
  (entry: any) => ({
    id: entry.id,
    oldStatus: entry.oldStatus,
    status: entry.newStatus,
    changedBy: entry.changedBy,
    note: entry.note,
    createdAt: entry.createdAt,
  }),
),
  };

  return <OrderDetails order={order} />;
}
