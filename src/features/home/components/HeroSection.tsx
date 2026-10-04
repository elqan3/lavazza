import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FadeIn from "./FadeIn";

export default function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden px-5 pb-16 pt-28 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-lavaza-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-lavaza-primary/5 blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn className="text-center lg:text-right">
          <p className="font-jakarta mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-lavaza-gold">
            Lavaza Mood Coffee Experience
          </p>

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            أهلاً بك في
            <span className="mt-2 block text-lavaza-gold">لافازا موود</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base leading-8 text-lavaza-primary/70 lg:mx-0 lg:text-lg">
            قهوة وحلويات محضّرة بعناية، وتجربة لافازا مصممة لتكون بسيطة وممتعة من أول زيارة.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/order"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lavaza-primary px-8 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-lavaza-primary/90 active:scale-[0.98]"
            >
              اطلب الآن
              <ArrowLeft size={18} />
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-lavaza-primary/15 bg-white px-8 py-4 text-sm font-semibold text-lavaza-primary shadow-sm transition hover:border-lavaza-gold/40 hover:text-lavaza-gold active:scale-[0.98]"
            >
              تصفح المنيو
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_24px_60px_rgba(26,42,74,0.12)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Image
                src="/menu/back001.jpg"
                alt="تجربة القهوة في لافازا"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-lavaza-primary/40 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-semibold text-lavaza-primary">
                أصناف محضّرة بشغف وخبرة
              </p>
              <p className="mt-1 text-xs text-lavaza-primary/60">
                Every dish has a story.
              </p>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-lavaza-gold px-5 py-4 shadow-lg lg:block">
            <p className="font-jakarta text-2xl font-bold text-lavaza-primary">☕</p>
            <p className="text-xs font-medium text-lavaza-primary/80">Premium Coffee</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
