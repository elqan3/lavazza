"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import FadeIn from "./FadeIn";
import { services } from "../data/content";

export default function ServicesSection() {
  return (
    <section id="services" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-12 text-center">
          <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.3em] text-lavaza-gold">
            Our Services
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">خدمات لافازا</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-lavaza-primary/65 sm:text-base">
            كل ما تحتاجه في مكان واحد — من المنيو الرقمي إلى مساحة التفاعل
          </p>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <FadeIn key={service.title} delay={index * 0.08}>
                <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={service.href}
                    className="group flex h-full flex-col rounded-3xl border border-lavaza-primary/8 bg-white p-6 shadow-sm transition hover:border-lavaza-gold/30 hover:shadow-md"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-lavaza-cream text-lavaza-gold transition group-hover:bg-lavaza-gold group-hover:text-white">
                      <Icon size={22} />
                    </div>

                    <h3 className="text-lg font-bold">{service.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-7 text-lavaza-primary/65">
                      {service.description}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-lavaza-gold">
                      اكتشف المزيد
                      <ArrowLeft
                        size={16}
                        className="transition group-hover:-translate-x-1"
                      />
                    </span>
                  </Link>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
