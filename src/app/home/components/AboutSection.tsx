import Image from "next/image";
import FadeIn from "./FadeIn";
import { aboutText } from "../data/content";

export default function AboutSection() {
  return (
    <section className="bg-lavaza-primary px-5 py-16 text-white lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] lg:max-w-md">
            <Image
              src="/logo.png"
              alt="Lavaza"
              fill
              loading="lazy"
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-contain p-12"
            />
            <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/5" />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.3em] text-lavaza-gold">
            About Us
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">نبذة عن لافازا</h2>
          <p className="mt-6 text-base leading-8 text-white/75">{aboutText}</p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: "+50", label: "مشروب" },
              { value: "100%", label: "جودة" },
              { value: "24/7", label: "رقمي" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center"
              >
                <p className="font-jakarta text-xl font-bold text-lavaza-gold">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
