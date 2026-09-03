import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsForm } from "@/components/features/settings/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [user, profile, skillProfile, goals] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.profile.findUnique({ where: { userId } }),
    db.skillProfile.findUnique({ where: { userId } }),
    db.userLearningGoal.findMany({ where: { userId } }),
  ]);

  if (!user || !profile || !skillProfile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and how the platform teaches you.</p>
      </div>
      <SettingsForm
        defaultValues={{
          name: user.name ?? "",
          region: profile.region,
          overallLevel: skillProfile.overallLevel,
          goals: goals.map((g) => g.goal),
          dailyGoalMinutes: profile.dailyGoalMinutes,
          focusAreas: profile.focusAreas,
          immersionLevel: profile.immersionLevel,
          correctionStyle: profile.correctionStyle === "immediate" ? "immediate" : "after",
          notificationsEnabled: profile.notificationsEnabled,
        }}
      />
    </div>
  );
}
