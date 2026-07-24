import type { Metadata } from "next";

import {
  Alexandria,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/auth/AuthProvider";

const alexandria = Alexandria({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${alexandria.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white font-[var(--font-arabic)]">
       <AuthProvider>
  {children}
  
</AuthProvider>
      </body>
    </html>
  );
}