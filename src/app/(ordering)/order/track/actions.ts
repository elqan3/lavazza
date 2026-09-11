"use server";

import { getGuestOrder } from "@/services/guest-order";
import type { GuestOrder } from "@/services/guest-order-types";

export async function loadGuestOrder(
  orderId: string,
  trackingToken: string,
): Promise<GuestOrder> {
  return getGuestOrder(orderId, trackingToken);
}