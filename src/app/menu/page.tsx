"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { Readex_Pro } from "next/font/google";

const menus = [
  "/menu/menu2.jpg",
  "/menu/menu5.jpg",
  "/menu/menu3.jpg",
  "/menu/menu6.jpg",
  "/menu/menu4.jpg",
  "/menu/menu1.jpg",
  "/menu/menu7.jpg",
];

// تجهيز قائمة الصور لمكتبة Lightbox
const slides = menus.map((src) => ({ src }));
const readex = Readex_Pro({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
export default function MenuPage() {
  const [index, setIndex] = useState(-1);

  return (
<main
>
      {/* ================= Header ================= */}
      <header className="bg-[#102040]/85 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-md mx-auto px-6 pt-6 pb-4 text-center">
          <Image
            src="/menu/logo.png"
            alt="Lavaza Logo"
            width={90}
            height={90}
            priority
            className="mx-auto select-none drop-shadow-xl"
          />

          <h1 className="mt-3 text-2xl font-extrabold text-white tracking-tight">
            منيو لافازا مود
          </h1>

          <h2 className="font-jakarta mt-0.5 text-xs font-semibold tracking-[0.25em] uppercase text-yellow-400">
            LAVAZA MOOD MENU
          </h2>

          <div className="w-16 h-[2px] bg-yellow-400 rounded-full mx-auto mt-3 mb-3" />

          <p className="text-white/70 text-xs leading-6">
            استمتع بأفضل المشروبات الساخنة والباردة والحلويات المحضرة بعناية
          </p>
        </div>
      </header>

      {/* ================= Menu Content ================= */}
      <section className="py-6">
        <div className="max-w-md mx-auto px-4 space-y-6">
          {menus.map((image, idx) => (
            <article
              key={image}
              onClick={() => setIndex(idx)}
              className="
                rounded-2xl
                overflow-hidden
                bg-white
                shadow-2xl
                ring-1
                ring-white/10
                transition-transform
                cursor-pointer
                active:scale-[0.98]
              "
            >
              {/* Card Header */}
              <div className="flex items-center justify-between bg-lavaza-blue px-4 py-2.5">
                <span className="font-jakarta text-[10px] uppercase tracking-[0.2em] text-white/80">
                  انقر للفتح والتكبير 🔍
                </span>
                <span className="font-jakarta bg-yellow-400 text-[#16284a] text-xs font-bold rounded-full px-3 py-0.5 shadow">
                  {idx + 1}
                </span>
              </div>

              {/* Menu Image */}
              <div className="relative w-full bg-white">
                <Image
                  src={image}
                  alt={`Lavaza Menu Page ${idx + 1}`}
                  width={800}
                  height={1150}
                  sizes="(max-width: 768px) 100vw, 450px"
                  quality={90}
                  loading={idx === 0 ? "eager" : "lazy"}
                  className="w-full h-auto object-contain block"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================= Lightbox Modal (تكبير الصور) ================= */}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
        }}
      />

      {/* ================= Footer ================= */}
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
