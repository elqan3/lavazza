import ProfilePage from "@/features/profile/components/ProfilePage";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <ProfilePage userId={id} />;
}