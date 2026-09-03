import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/features/dashboard/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [profile, progress] = await Promise.all([
    db.profile.findUnique({ where: { userId: session.user.id } }),
    db.userProgress.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!profile?.onboardingCompleted) redirect("/onboarding");

  return (
    <AppShell
      user={{ name: session.user.name, email: session.user.email }}
      streak={progress?.currentStreak ?? 0}
      xp={progress?.totalXp ?? 0}
    >
      {children}
    </AppShell>
  );
}
