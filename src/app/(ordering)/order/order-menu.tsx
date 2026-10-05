"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  sort_order: number;
};

type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sort_order: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Props = {
  categories: Category[];
  products: Product[];
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ar-LY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

export default function OrderMenu({
  categories,
  products,
}: Props) {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? "",
  );

  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Restore cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(
        "lavaza-order-cart",
      );

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to restore cart:", error);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!cartLoaded) return;

    localStorage.setItem(
      "lavaza-order-cart",
      JSON.stringify(cart),
    );
  }, [cart, cartLoaded]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        !activeCategory ||
        product.category_id === activeCategory;

      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.description
          ?.toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  // Cart count
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Cart total
  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0,
  );

  // Add product
  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id,
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }

  // Decrease quantity
  function decreaseQuantity(productId: string) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  // Increase quantity
  function increaseQuantity(productId: string) {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }

  // Remove product
  function removeFromCart(productId: string) {
    setCart((current) =>
      current.filter(
        (item) => item.product.id !== productId,
      ),
    );
  }

  // Scroll to category
  function scrollToCategory(categoryId: string) {
    setActiveCategory(categoryId);

    requestAnimationFrame(() => {
      document
        .getElementById(`category-${categoryId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#faf9f6] text-neutral-900"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#faf9f6]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image
                  src="/logo.png"
                  alt="Lavaza Mod"
                  fill
                  priority
                  className="object-contain p-1"
                />
              </div>

              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] text-neutral-400">
                  LAVAZA MOD
                </p>

                <h1 className="text-lg font-black leading-none">
                  اطلب الآن
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-lg shadow-black/10 transition hover:scale-[1.03] active:scale-95"
              aria-label="فتح السلة"
            >
              <ShoppingBag size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d6a756] px-1 text-[10px] font-black text-white ring-2 ring-[#faf9f6]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-neutral-900 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-[#d6a756]/20 blur-3xl" />

          <div className="absolute -bottom-20 right-0 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <div className="mb-3 flex items-center gap-2 text-[#e4bd70]">
              <Sparkles size={16} />

              <span className="text-xs font-bold">
                أهلاً بك في لافازا مود
              </span>
            </div>

            <h2 className="max-w-xl text-3xl font-black leading-tight sm:text-4xl">
              اختار اللي تحبه،
              <br />

              <span className="text-[#e4bd70]">
                وخلي علينا الباقي ☕
              </span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">
              تصفح قائمتنا، اختر طلبك وأرسله بسهولة من هاتفك.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <Search
            size={19}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن مشروب أو حلى..."
            className="h-14 w-full rounded-2xl border border-black/5 bg-white pr-12 pl-12 text-sm font-medium shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-[#d6a756]/50 focus:ring-4 focus:ring-[#d6a756]/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-900"
              aria-label="مسح البحث"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Categories */}
      <nav className="sticky top-20 z-30 mt-5 border-y border-black/5 bg-[#faf9f6]/95 py-3 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  scrollToCategory(category.id)
                }
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  activeCategory === category.id
                    ? "bg-neutral-900 text-white shadow-md"
                    : "bg-white text-neutral-600 ring-1 ring-black/5 hover:bg-neutral-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        {search ? (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold text-neutral-400">
                نتائج البحث
              </p>

              <h3 className="mt-1 text-2xl font-black">
                {filteredProducts.length} منتج
              </h3>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptySearch />
            ) : (
              <ProductGrid
                products={filteredProducts}
                cart={cart}
                onAdd={addToCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            )}
          </>
        ) : (
          <div className="space-y-14">
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (product) =>
                  product.category_id === category.id,
              );

              if (categoryProducts.length === 0) {
                return null;
              }

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className="scroll-mt-40"
                >
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#b88934]">
                        LAVAZA MENU
                      </p>

                      <h3 className="mt-1 text-2xl font-black sm:text-3xl">
                        {category.name}
                      </h3>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-neutral-400 ring-1 ring-black/5">
                      {categoryProducts.length} صنف
                    </span>
                  </div>

                  <ProductGrid
                    products={categoryProducts}
                    cart={cart}
                    onAdd={addToCart}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                  />
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating cart */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex w-full items-center justify-between rounded-[1.5rem] bg-neutral-900 px-5 py-4 text-white shadow-2xl shadow-black/20 transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShoppingBag size={19} />
                </div>

                <div className="text-right">
                  <p className="text-xs text-white/50">
                    طلبك الحالي
                  </p>

                  <p className="font-black">
                    {cartCount}{" "}
                    {cartCount === 1 ? "صنف" : "أصناف"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black">
                  {formatPrice(cartTotal)} د.ل
                </span>

                <ArrowLeft size={18} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Cart */}
      {cartOpen && (
        <CartSheet
          cart={cart}
          total={cartTotal}
          onClose={() => setCartOpen(false)}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onRemove={removeFromCart}
          onCheckout={() => {
            setCartOpen(false);
            router.push("/order/checkout");
          }}
        />
      )}
    </main>
  );
}

function ProductGrid({
  products,
  cart,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  products: Product[];
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => {
        const cartItem = cart.find(
          (item) => item.product.id === product.id,
        );

        return (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="relative h-20 w-20 opacity-20 grayscale">
                    <Image
                      src="/logo.png"
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {cartItem && (
                <div className="absolute right-2 top-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-neutral-900 px-2 text-xs font-black text-white shadow-lg">
                  {cartItem.quantity}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-3.5">
              <h4 className="line-clamp-2 min-h-[2.75rem] text-sm font-black leading-6">
                {product.name}
              </h4>

              {product.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
                  {product.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <div>
                  <span className="text-base font-black">
                    {formatPrice(product.price)}
                  </span>

                  <span className="mr-1 text-[10px] font-bold text-neutral-400">
                    د.ل
                  </span>
                </div>

                {!cartItem ? (
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-[#b88934] active:scale-90"
                    aria-label={`إضافة ${product.name}`}
                  >
                    <Plus size={19} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1">
                    <button
                      type="button"
                      onClick={() =>
                        onDecrease(product.id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-white"
                      aria-label="تقليل الكمية"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="w-5 text-center text-xs font-black">
                      {cartItem.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onIncrease(product.id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white transition active:scale-90"
                      aria-label="زيادة الكمية"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function CartSheet({
  cart,
  total,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}: {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="إغلاق السلة"
      />

      <div className="absolute inset-x-0 bottom-0 h-[88dvh] max-h-[88dvh] min-h-0 overflow-hidden rounded-t-[2rem] bg-[#faf9f6] shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-r-[2rem]">
        <div className="flex h-full min-h-0 flex-col">
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-5">
            <div>
              <p className="text-xs font-bold text-neutral-400">
                LAVAZA MOD
              </p>

              <h2 className="text-xl font-black">
                طلبك
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-neutral-600 shadow-sm ring-1 ring-black/5"
              aria-label="إغلاق"
            >
              <X size={19} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {cart.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-neutral-300 shadow-sm">
                  <ShoppingBag size={28} />
                </div>

                <h3 className="font-black">
                  السلة فارغة
                </h3>

                <p className="mt-1 text-sm text-neutral-400">
                  أضف شيئًا لذيذًا من القائمة 😋
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="rounded-2xl bg-white p-3 ring-1 ring-black/5"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Image
                            src="/logo.png"
                            alt=""
                            fill
                            className="object-contain p-3 opacity-20 grayscale"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 text-sm font-black leading-5">
                            {item.product.name}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              onRemove(item.product.id)
                            }
                            className="shrink-0 text-neutral-300 transition hover:text-red-500"
                            aria-label="حذف المنتج"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-black">
                            {formatPrice(
                              item.product.price *
                                item.quantity,
                            )}{" "}
                            <span className="text-[10px] text-neutral-400">
                              د.ل
                            </span>
                          </span>

                          <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1">
                            <button
                              type="button"
                              onClick={() =>
                                onDecrease(
                                  item.product.id,
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white"
                              aria-label="تقليل الكمية"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="w-6 text-center text-xs font-black">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                onIncrease(
                                  item.product.id,
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white"
                              aria-label="زيادة الكمية"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="border-t border-black/5 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-500">
                  الإجمالي
                </span>

                <span className="text-xl font-black">
                  {formatPrice(total)} د.ل
                </span>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:bg-[#b88934] active:scale-[0.99]"
              >
                متابعة الطلب

                <ArrowLeft size={18} />
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-neutral-400">
                رسوم التوصيل غير مشمولة في الإجمالي.
                <br />
                يتم تحديدها بشكل منفصل حسب موقع التوصيل.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-[2rem] bg-white px-6 text-center ring-1 ring-black/5">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-300">
        <Search size={28} />
      </div>

      <h3 className="font-black">
        لم نجد هذا المنتج
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-400">
        جرّب البحث باسم مختلف أو تصفح التصنيفات الموجودة في القائمة.
      </p>
    </div>
  );
}