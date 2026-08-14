"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function GlobalNavigation() {
  const pathname = usePathname();

  const hiddenRoutes = [
    "/login",
    "/auth",
    "/admin",
  ];

  const shouldHide = hiddenRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (shouldHide) {
    return null;
  }

  return <BottomNav />;
}