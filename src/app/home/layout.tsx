import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-readex",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "لافازا | الصفحة الرئيسية",
  description:
    "مرحباً بك في لافازا — تجربة قهوة عصرية، منيو رقمي، ومساحة تفاعلية بين يديك.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${readexPro.variable} min-h-screen bg-lavaza-cream font-[family-name:var(--font-readex)] text-lavaza-primary antialiased`}
    >
      {children}
    </div>
  );
}
