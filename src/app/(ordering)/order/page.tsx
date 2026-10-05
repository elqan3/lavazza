import { createClient } from "@/services/supabase/server";
import type { Metadata } from "next";
import OrderMenu from "./order-menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  manifest: "/order/manifest.webmanifest",
  themeColor: "#111111",
};

export default async function OrderPage() {
  const supabase = await createClient();

  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase
        .from("product_categories")
        .select("id, name, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),

      supabase
        .from("products")
        .select(
          "id, category_id, name, description, price, image_url, sort_order",
        )
        .eq("is_available", true)
        .order("sort_order", { ascending: true }),
    ]);

  if (categoriesError || productsError) {
    console.error("Ordering menu error:", {
      categoriesError,
      productsError,
    });
  }

  return (
    <OrderMenu
      categories={categories ?? []}
      products={products ?? []}
    />
  );
}