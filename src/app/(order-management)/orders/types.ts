export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "rejected";

export type OrderType =
  | "dine_in"
  | "pickup"
  | "delivery";

export type PaymentMethod =
  | "bank_transfer"
  | "cash_on_delivery";

export type PaymentStatus =
  | "pending"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "paid"
  | "failed";

export type ManagementOrder = {
  order_id: string;
  order_number: number;
  order_type: OrderType;
  order_status: OrderStatus;
  branch_id: string;
  branch_name: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_deadline: string | null;
  proof_count: number;
  latest_proof_at: string | null;
  created_at: string;
  updated_at: string;
};