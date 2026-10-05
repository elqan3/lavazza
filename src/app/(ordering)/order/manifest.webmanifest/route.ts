import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "لافازا | الطلب",
    short_name: "لافازا",
    description: "اطلب من لافازا وتابع طلبك",
    lang: "ar",
    dir: "rtl",
    start_url: "/order",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
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
