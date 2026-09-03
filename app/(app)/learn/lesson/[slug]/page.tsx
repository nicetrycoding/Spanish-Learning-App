import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getLessonRunnerData } from "@/services/content-service";
import { LessonRunner } from "@/components/features/learn/lesson-runner";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getLessonRunnerData(slug, session.user.id);
  if (!data) notFound();

  const { lesson, completedExerciseIds } = data;
  const remainingExercises = lesson.exercises
    .filter((e) => !completedExerciseIds.has(e.id))
    .map((e) => ({
      id: e.id,
      type: e.type,
      prompt: e.prompt,
      data: e.data,
      explanation: e.explanation,
      cefrLevel: e.cefrLevel,
      skillTag: e.skillTag,
    }));

  return (
    <div className="mx-auto max-w-2xl">
      <LessonRunner
        lesson={{
          id: lesson.id,
          title: lesson.title,
          explanation: lesson.explanation,
          examples: lesson.examples as { es: string; en: string; note?: string }[],
          cefrLevel: lesson.cefrLevel,
        }}
        exercises={remainingExercises}
        levelHref={`/learn/${lesson.module.courseLevel.level.toLowerCase()}`}
      />
    </div>
  );
}
