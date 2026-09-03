import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGrammarPracticeSet } from "@/services/grammar-service";
import { GrammarPracticeSession } from "@/components/features/grammar/grammar-practice-session";

export const metadata: Metadata = { title: "Practice" };

export default async function GrammarTopicPracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const topic = await db.grammarTopic.findUnique({ where: { slug } });
  if (!topic) notFound();

  const exercises = await getGrammarPracticeSet(topic.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold">{topic.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quick practice</p>
      </div>
      <GrammarPracticeSession
        topicId={topic.id}
        topicSlug={slug}
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
