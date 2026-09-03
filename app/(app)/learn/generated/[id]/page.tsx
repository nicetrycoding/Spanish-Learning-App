import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getGeneratedLesson } from "@/services/lesson-generator-service";
import type { GeneratedLessonContent } from "@/lib/ai/schemas";
import { GeneratedLessonView } from "@/components/features/lesson-generator/generated-lesson-view";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Generated lesson" };

export default async function GeneratedLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const lesson = await getGeneratedLesson(session.user.id, id);
  if (!lesson) notFound();
  const content = lesson.content as unknown as GeneratedLessonContent;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {lesson.cefrLevel}
        </Badge>
        <h1 className="font-serif-display text-2xl font-semibold">{content.title || lesson.topic}</h1>
      </div>
      <GeneratedLessonView content={content} />
    </div>
  );
}
