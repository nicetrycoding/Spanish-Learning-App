import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shadowingSentencesByLevel } from "@/lib/speaking/prompts";
import { ShadowingRunner } from "@/components/features/speaking/shadowing-runner";

export const metadata: Metadata = { title: "Shadowing" };

export default async function ShadowingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const skillProfile = await db.skillProfile.findUnique({ where: { userId: session.user.id } });
  const level = skillProfile?.speakingLevel ?? "A1";
  const sentences = shadowingSentencesByLevel(level === "A0" ? "A1" : level);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold">Shadowing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Listen → repeat → record → compare → retry.</p>
      </div>
      <ShadowingRunner sentences={sentences.length > 0 ? sentences : shadowingSentencesByLevel("A1")} />
    </div>
  );
}
