"use client";

import Image from "next/image";

import MenuHeader from "@/features/menu/components/MenuHeader";
import MenuGallery from "@/features/menu/components/MenuGallery";

export default function MenuPage() {
  return (
    <main>
      <MenuHeader />

      <MenuGallery />

      <footer className="border-t border-white/10 mt-6 bg-[#0a1326]">
        <div className="max-w-md mx-auto px-6 py-8 text-center">
          <Image
            src="/menu/logo.png"
            alt="Lavaza"
            width={45}
            height={45}
            className="mx-auto mb-2 opacity-80"
          />

          <p className="text-xs text-white/60">
            نتمنى لكم تجربة ممتعة في Lavaza MOOD
          </p>
        </div>
      </footer>
    </main>
  );
}