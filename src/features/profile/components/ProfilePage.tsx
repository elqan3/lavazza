import Link from "next/link";
import { Home } from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import ProfilePosts from "./ProfilePosts";

type Props = { userId: string };

export default function ProfilePage({ userId }: Props) {
  return (
    <main dir="rtl" className="min-h-[100dvh] bg-[#f6f3ed] pb-8 text-[#16284a]">
      <div className="mx-auto flex w-full max-w-xl justify-end px-4 pt-4">
        <Link href="/home" aria-label="الرئيسية" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#16284a]/10 bg-white text-[#16284a] shadow-sm transition active:scale-95">
          <Home size={18} />
        </Link>
      </div>
      <div className="pt-2">
        <ProfileHeader userId={userId} />
        <ProfilePosts userId={userId} />
      </div>
    </main>
  );
}
