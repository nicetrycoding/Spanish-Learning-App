import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTargetedPracticeForMistake } from "@/services/mistake-service";
import { PracticeSession } from "@/components/features/practice/practice-session";

export const metadata: Metadata = { title: "Targeted practice" };

export default async function MistakePracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const mistake = await db.mistake.findUnique({ where: { id } });
  if (!mistake || mistake.userId !== session.user.id) notFound();

  const exercises = await getTargetedPracticeForMistake(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold">Targeted practice</h1>
        <p className="mt-1 text-sm text-muted-foreground">Focused on the pattern behind: "{mistake.userInput}"</p>
      </div>
      <PracticeSession
        emptyHref="/mistakes"
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
