import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "../data/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-lavaza-primary/8 bg-white px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Lavaza"
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold">لافازا</span>
          </Link>

          <nav>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-lavaza-primary/65 transition hover:text-lavaza-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-lavaza-primary/8 pt-8 text-center">
          <p className="text-sm text-lavaza-primary/50">
            © {year} Lavaza. جميع الحقوق محفوظة.
          </p>
          <p className="font-jakarta mt-2 text-xs tracking-wider text-lavaza-primary/40">
            Crafted with ☕ in Libya
          </p>
        </div>
      </div>
    </footer>
  );
}
