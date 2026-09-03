import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getListeningExercise } from "@/services/listening-service";
import { ListeningPlayer } from "@/components/features/listening/listening-player";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: id };
}

export default async function ListeningExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exercise = await getListeningExercise(id);
  if (!exercise) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {exercise.cefrLevel}
        </Badge>
        <h1 className="font-serif-display text-2xl font-semibold">{exercise.title}</h1>
      </div>
      <ListeningPlayer
        exerciseId={exercise.id}
        transcriptEs={exercise.transcriptEs}
        region={exercise.region}
        questions={exercise.questions as { id: string; question: string; options: string[]; correctIndex: number }[]}
      />
    </div>
  );
}
