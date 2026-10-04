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

          <Link
            href="/order"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-lavaza-gold px-6 py-3 text-sm font-semibold text-lavaza-primary transition hover:bg-white active:scale-[0.98]"
          >
            اطلب الآن
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
