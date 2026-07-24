import type { ReactNode } from "react";

export default function MenuLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        min-h-screen
        font-[var(--font-arabic)]
        text-[#171717]
        bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_20%,#d6e8ff_45%,#7ea8e8_75%,#1a2a4a_100%)]
        bg-cover
        bg-fixed
        bg-no-repeat
      "
    >
      {children}
    </div>
  );
}