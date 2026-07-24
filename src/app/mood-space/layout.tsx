import BottomNav from "@/components/navigation/BottomNav";

export default function MoodSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}