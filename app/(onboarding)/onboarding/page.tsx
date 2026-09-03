import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OnboardingWizard } from "@/components/features/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Get started" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (profile?.onboardingCompleted) redirect("/dashboard");

  return <OnboardingWizard />;
}
