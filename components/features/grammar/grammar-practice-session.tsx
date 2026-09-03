"use client";

import { useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExerciseRunner, type RunnerExercise } from "@/components/features/practice/exercise-runner";
import { practiceGrammarTopicAction } from "@/actions/grammar-actions";
import type { ConfidenceLevel } from "@prisma/client";

export function GrammarPracticeSession({
  topicId,
  topicSlug,
  exercises,
}: {
  topicId: string;
  topicSlug: string;
  exercises: RunnerExercise[];
}) {
  const [index, setIndex] = useState(0);
  const current = exercises[index];

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-muted-foreground">No practice exercises available for this topic yet.</p>
          <Button asChild variant="outline">
            <Link href={`/grammar/${topicSlug}`}>Back to topic</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="rounded-full bg-success/10 p-3">
            <PartyPopper className="h-6 w-6 text-success" />
          </div>
          <h2 className="font-serif-display text-xl font-semibold">Practice complete</h2>
          <Button asChild>
            <Link href={`/grammar/${topicSlug}`}>Back to topic</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Progress value={(index / exercises.length) * 100} />
      <ExerciseRunner
        key={current.id}
        exercise={current}
        askConfidence={index % 2 === 0}
        onSubmit={(input: { exerciseId: string; userAnswer: unknown; confidence?: ConfidenceLevel }) =>
          practiceGrammarTopicAction({ topicId, ...input })
        }
        onDone={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}
