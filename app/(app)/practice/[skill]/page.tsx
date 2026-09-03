import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { SkillType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getQuickPracticeSet } from "@/services/practice-service";
import { SKILLS, SKILL_LABELS } from "@/lib/cefr";
import { PracticeSession } from "@/components/features/practice/practice-session";

export async function generateMetadata({ params }: { params: Promise<{ skill: string }> }): Promise<Metadata> {
  const { skill } = await params;
  return { title: `Practice · ${skill}` };
}

export default async function PracticeSkillPage({ params }: { params: Promise<{ skill: string }> }) {
  const { skill } = await params;
  const skillKey = skill.toUpperCase() as SkillType;
  if (!SKILLS.includes(skillKey as never)) notFound();

  const session = await auth();
  if (!session?.user) redirect("/login");

  const exercises = await getQuickPracticeSet(session.user.id, skillKey, 8);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold">{SKILL_LABELS[skillKey]} practice</h1>
        <p className="mt-1 text-sm text-muted-foreground">A quick, focused set at your current level.</p>
      </div>
      <PracticeSession
        exercises={exercises.map((e) => ({
          id: e.id,
          type: e.type,
          prompt: e.prompt,
          data: e.data,
          explanation: e.explanation,
          cefrLevel: e.cefrLevel,
          skillTag: e.skillTag,
        }))}
      />
    </div>
  );
}
