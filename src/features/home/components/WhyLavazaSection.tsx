"use client";

import { motion } from "framer-motion";
import FadeIn from "./FadeIn";
import { whyLavaza } from "../data/content";

export default function WhyLavazaSection() {
  return (
    <section className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-12 text-center">
          <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.3em] text-lavaza-gold">
            Why Lavaza
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">لماذا لافازا؟</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-lavaza-primary/65 sm:text-base">
            نقدّم تجربة متكاملة تجمع بين الجودة والراحة والابتكار
          </p>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyLavaza.map((item, index) => {
            const Icon = item.icon;

            return (
              <FadeIn key={item.title} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full rounded-3xl border border-lavaza-primary/8 bg-white p-6 text-center shadow-sm transition hover:border-lavaza-gold/25 hover:shadow-md sm:text-right"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lavaza-primary text-lavaza-gold sm:mr-0 sm:ml-auto">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-lavaza-primary/65">
                    {item.description}
                  </p>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
