"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Quote as QuoteIcon } from "lucide-react";
import FadeIn from "./FadeIn";
import { quotes } from "../data/content";

function pickRandomQuote(exclude?: string) {
  const pool = exclude
    ? quotes.filter((quote) => quote !== exclude)
    : quotes;

  return pool[Math.floor(Math.random() * pool.length)];
}

export default function QuoteSection() {
  const [quote, setQuote] = useState(() => pickRandomQuote());

  const refreshQuote = useCallback(() => {
    setQuote((current) => pickRandomQuote(current));
  }, []);

  return (
    <section id="quote" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] border border-lavaza-gold/20 bg-white p-8 shadow-[0_20px_50px_rgba(26,42,74,0.08)] sm:p-12">
            <div className="pointer-events-none absolute -right-6 -top-6 text-lavaza-gold/10">
              <QuoteIcon size={120} />
            </div>

            <p className="font-jakarta text-center text-xs font-semibold uppercase tracking-[0.3em] text-lavaza-gold">
              Quote of the Day
            </p>
            <h2 className="mt-3 text-center text-2xl font-bold sm:text-3xl">
              اقتباس اليوم
            </h2>

            <motion.blockquote
              key={quote}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mt-10 text-center"
            >
              <span className="text-4xl leading-none text-lavaza-gold">"</span>
              <p className="mx-auto max-w-lg text-lg leading-10 text-lavaza-primary/80 sm:text-xl">
                {quote}
              </p>
              <span className="text-4xl leading-none text-lavaza-gold">"</span>
            </motion.blockquote>

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={refreshQuote}
                className="inline-flex items-center gap-2 rounded-2xl border border-lavaza-primary/10 bg-lavaza-cream px-6 py-3 text-sm font-semibold text-lavaza-primary transition hover:border-lavaza-gold/40 hover:text-lavaza-gold active:scale-[0.98]"
              >
                <RefreshCw size={16} />
                اقتباس جديد
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
