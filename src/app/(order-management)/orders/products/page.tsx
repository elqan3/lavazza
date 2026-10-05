import { loadManagementProducts } from "./actions";
import ProductsClient from "./products-client";

export default async function ProductsPage() {
  const products = await loadManagementProducts();
  return <ProductsClient initialProducts={products} />;
}
