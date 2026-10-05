import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "لافازا | الإدارة",
    short_name: "لافازا إدارة",
    description: "إدارة طلبات وتشغيل فروع لافازا",
    lang: "ar",
    dir: "rtl",
    start_url: "/orders",
    scope: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#111111",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  });
}
