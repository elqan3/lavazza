"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "../data/content";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
        <div className="flex w-full items-center justify-between rounded-2xl border border-white/40 bg-[#1A2A4A]/80 px-4 py-3 shadow-sm backdrop-blur-md">
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Lavaza"
              width={44}
              height={44}
              priority
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-white">
             لافازا MOOD 
            </span>
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-white/90 transition-colors duration-200 hover:text-lavaza-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-xl p-2 text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-5 mt-2 overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-lg backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col p-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-lavaza-primary/90 transition-colors duration-200 hover:bg-lavaza-cream hover:text-lavaza-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}