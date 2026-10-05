import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/services/supabase/server";

import OrdersDashboard from "./orders-dashboard";

import type {
  ManagementOrder,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "./types";

export const metadata: Metadata = {
  manifest: "/orders/manifest.webmanifest",
  themeColor: "#111111",
};

type RawManagementOrder = {
  order_id: string;
  order_number: number | string;
  order_type: OrderType;
  order_status: OrderStatus;
  branch_id: string;
  branch_name: string;
  customer_name: string;
  customer_phone: string;
  total: number | string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_deadline: string | null;
  proof_count: number | string;
  latest_proof_at: string | null;
  created_at: string;
  updated_at: string;
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase.rpc(
    "get_order_management_orders",
    {
      p_status: null,
      p_search: null,
      p_limit: 100,
      p_offset: 0,
    },
  );

  if (error) {
    console.error(
      "Load management orders error:",
      error,
    );

    throw new Error(
      error.message ||
        "تعذر تحميل الطلبات.",
    );
  }

  const orders: ManagementOrder[] = (
    (data ?? []) as RawManagementOrder[]
  ).map((order) => ({
    ...order,
    order_number: Number(
      order.order_number,
    ),
    total: Number(order.total),
    proof_count: Number(
      order.proof_count,
    ),
  }));

  return (
    <OrdersDashboard
      initialOrders={orders}
    />
  );
}
