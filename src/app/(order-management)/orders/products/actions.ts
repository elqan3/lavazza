"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/services/supabase/server";

export type ManagementProduct = {
  id: string;
  category_id: string | null;
  category_name: string | null;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
};

export async function loadManagementProducts(): Promise<ManagementProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_order_management_products");

  if (error) {
    console.error("Load management products error:", error);
    throw new Error(error.message || "تعذر تحميل المنتجات.");
  }

  return ((data ?? []) as ManagementProduct[]).map((product) => ({
    ...product,
    price: Number(product.price),
  }));
}

export async function setProductAvailability(
  productId: string,
  isAvailable: boolean,
) {
  if (!productId?.trim()) {
    throw new Error("معرّف المنتج غير صالح.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("set_product_availability", {
    p_product_id: productId,
    p_is_available: isAvailable,
  });

  if (error) {
    console.error("Set product availability error:", error);
    throw new Error(error.message || "تعذر تحديث توفر المنتج.");
  }

  revalidatePath("/order");
  revalidatePath("/orders/products");

  return data?.[0] ?? null;
}
