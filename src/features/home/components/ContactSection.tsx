import Link from "next/link";
import { Clock, MapPin, Phone, Share2, Globe } from "lucide-react";
import FadeIn from "./FadeIn";
import { contactInfo } from "../data/content";

export default function ContactSection() {
  return (
    <section id="contact" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-12 text-center">
          <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.3em] text-lavaza-gold">
            Contact
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            الموقع والتواصل
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-lavaza-primary/65 sm:text-base">
            نحن في انتظارك — زُرنا واستمتع بتجربة لافازا
          </p>
        </FadeIn>

        <div className="grid gap-5 lg:grid-cols-2">
          <FadeIn>
            <div className="h-full rounded-3xl border border-lavaza-primary/8 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold">معلومات التواصل</h3>

              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lavaza-cream text-lavaza-gold">
                    <MapPin size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">الموقع</p>
                    <p className="mt-1 text-sm text-lavaza-primary/65">
                      {contactInfo.address}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lavaza-cream text-lavaza-gold">
                    <Clock size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">أوقات العمل</p>
                    <p className="mt-1 text-sm text-lavaza-primary/65">
                      {contactInfo.hours}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lavaza-cream text-lavaza-gold">
                    <Phone size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">الهاتف</p>
                    <a
                      href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                      className="mt-1 block text-sm text-lavaza-primary/65 transition hover:text-lavaza-gold"
                      dir="ltr"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </li>
              </ul>

              <div className="mt-8 border-t border-lavaza-primary/8 pt-6">
                <p className="text-sm font-semibold">وسائل التواصل</p>
                <div className="mt-4 flex gap-3">
                  <a
                    href={contactInfo.social[0].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavaza-cream text-lavaza-primary transition hover:bg-lavaza-gold hover:text-white"
                  >
                    <Share2 size={20} />
                  </a>
                  <a
                    href={contactInfo.social[1].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavaza-cream text-lavaza-primary transition hover:bg-lavaza-gold hover:text-white"
                  >
                    <Globe size={20} />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-3xl border border-lavaza-primary/8 bg-lavaza-primary p-8 text-center text-white shadow-sm">
              <MapPin className="text-lavaza-gold" size={48} />
              <h3 className="mt-6 text-xl font-bold">زُر مقهى لافازا</h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
                امسح رمز QR داخل المقهى للوصول السريع إلى المنيو ومساحة لافازا
                وجميع خدماتنا
              </p>
              <Link
                href="/menu"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-lavaza-gold px-6 py-3 text-sm font-semibold text-lavaza-primary transition hover:bg-white active:scale-[0.98]"
              >
                ابدأ التجربة
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
