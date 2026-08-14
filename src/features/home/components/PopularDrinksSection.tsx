"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import FadeIn from "./FadeIn";
import { popularDrinks } from "../data/content";

export default function PopularDrinksSection() {
  return (
    <section className="bg-white px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-12 text-center">
          <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.3em] text-lavaza-gold">
            Best Sellers
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">الأكثر طلباً</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-lavaza-primary/65 sm:text-base">
            اختيارات عملائنا المفضّلة — محضّرة بعناية في كل زيارة
          </p>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularDrinks.map((drink, index) => (
            <FadeIn key={drink.name} delay={index * 0.08}>
              <motion.article
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="overflow-hidden rounded-3xl border border-lavaza-primary/8 bg-lavaza-cream shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={drink.image}
                    alt={drink.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{drink.name}</h3>
                      <p className="font-jakarta mt-1 text-xs uppercase tracking-wider text-lavaza-primary/50">
                        {drink.nameEn}
                      </p>
                    </div>
                    <span className="rounded-full bg-lavaza-gold/15 px-3 py-1 text-sm font-bold text-lavaza-primary">
                      {drink.price}
                    </span>
                  </div>

                  <Link
                    href="/menu"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-lavaza-gold transition hover:text-lavaza-primary"
                  >
                    التفاصيل
                    <ArrowLeft size={16} />
                  </Link>
                </div>
              </motion.article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
