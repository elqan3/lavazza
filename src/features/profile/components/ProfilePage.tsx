import ProfileHeader from "./ProfileHeader";
import ProfilePosts from "./ProfilePosts";

type Props = {
  userId: string;
};

export default function ProfilePage({ userId }: Props) {
  return (
    <main className="min-h-screen bg-[#0f1d35] text-white">
      <ProfileHeader userId={userId} />
      <ProfilePosts userId={userId} />
    </main>
  );
}