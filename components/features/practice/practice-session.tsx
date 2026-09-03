"use client";

import { useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExerciseRunner, type RunnerExercise } from "@/components/features/practice/exercise-runner";

export function PracticeSession({ exercises, emptyHref = "/practice" }: { exercises: RunnerExercise[]; emptyHref?: string }) {
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-muted-foreground">No exercises available for this skill yet.</p>
          <Button asChild variant="outline">
            <Link href={emptyHref}>Back to practice</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const current = exercises[index];

  if (!current) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="rounded-full bg-success/10 p-3">
            <PartyPopper className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="font-serif-display text-xl font-semibold">Session complete</h2>
            <p className="mt-1 text-muted-foreground">
              {correct}/{exercises.length} correct · +{xp} XP
            </p>
          </div>
          <Button asChild>
            <Link href={emptyHref}>Back to practice</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {index + 1} of {exercises.length}
          </span>
        </div>
        <Progress value={(index / exercises.length) * 100} />
      </div>
      <ExerciseRunner
        key={current.id}
        exercise={current}
        askConfidence={index % 3 === 0}
        onDone={(result) => {
          setXp((x) => x + result.xpEarned);
          if (result.isCorrect) setCorrect((c) => c + 1);
          setIndex((i) => i + 1);
        }}
      />
    </div>
  );
}
