import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/features/auth/components/AuthProvider";
import GlobalNavigation from "@/components/navigation/GlobalNavigation";
import PWARegister from "@/components/pwa/PWARegister";

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-readex",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "لافازا | تجربة القهوة",
  description: "استمتع بلحظتك مع لافازا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readexPro.variable} h-full antialiased`}
    >
      <body
        className="
          min-h-full
          bg-white
          font-[family-name:var(--font-readex)]
        "
      >
        <AuthProvider>
          <PWARegister />
          {children}
          <GlobalNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}