export type GuestOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type GuestOrderStatusHistory = {
  status: string;
  note: string | null;
  createdAt: string;
};

export type GuestOrder = {
  orderId: string;
  orderNumber: number;
  orderType: "dine_in" | "pickup" | "delivery";
  orderStatus: string;

  customerName: string;
  customerPhone: string;
  customerNotes: string | null;

  tableNumber: string | null;
  deliveryAddress: string | null;
  deliveryLocationNote: string | null;

  subtotal: number;
  total: number;

  createdAt: string;
  updatedAt: string;
  paymentDeadline: string | null;

  paymentMethod:
    | "bank_transfer"
    | "cash_on_delivery";

  paymentStatus: string;
  paymentRejectionReason: string | null;

  items: GuestOrderItem[];
  statusHistory: GuestOrderStatusHistory[];
};