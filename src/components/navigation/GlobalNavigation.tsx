"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function GlobalNavigation() {
  const pathname = usePathname();

  // Mood Space has its own navigation. Keep the bottom nav
  // scoped to the feed instead of making it global across Lavaza.
  if (!pathname.startsWith("/mood-space")) {
    return null;
  }

  return <BottomNav />;
}
