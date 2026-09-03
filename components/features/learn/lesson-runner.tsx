"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExerciseRunner, type RunnerExercise } from "@/components/features/practice/exercise-runner";
import { completeLessonAction } from "@/actions/exercise-actions";
import { speakSpanish } from "@/lib/speech";

interface LessonRunnerProps {
  lesson: {
    id: string;
    title: string;
    explanation: string;
    examples: { es: string; en: string; note?: string }[];
    cefrLevel: string;
  };
  exercises: RunnerExercise[];
  levelHref: string;
}

type Stage = "learn" | "practice" | "done";

export function LessonRunner({ lesson, exercises, levelHref }: LessonRunnerProps) {
  const [stage, setStage] = useState<Stage>(exercises.length > 0 ? "learn" : "done");
  const [index, setIndex] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const current = exercises[index];
  const progressPct = exercises.length ? (index / exercises.length) * 100 : 100;

  const summary = useMemo(
    () => ({ total: exercises.length, correct: correctCount, xp: xpTotal }),
    [exercises.length, correctCount, xpTotal],
  );

  async function handleExerciseDone(result: { isCorrect: boolean; xpEarned: number }) {
    setXpTotal((x) => x + result.xpEarned);
    if (result.isCorrect) setCorrectCount((c) => c + 1);

    if (index + 1 < exercises.length) {
      setIndex((i) => i + 1);
    } else {
      await completeLessonAction(lesson.id);
      setStage("done");
    }
  }

  if (stage === "learn") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Learn</CardDescription>
              <Badge variant="secondary">{lesson.cefrLevel}</Badge>
            </div>
            <CardTitle className="font-serif-display text-2xl">{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="leading-relaxed text-foreground/90 whitespace-pre-line">{lesson.explanation}</p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Examples</p>
              {lesson.examples.map((ex, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded-md bg-muted p-3">
                  <div>
                    <p className="font-serif-display">{ex.es}</p>
                    <p className="text-sm text-muted-foreground">{ex.en}</p>
                    {ex.note && <p className="mt-1 text-xs text-accent">{ex.note}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakSpanish(ex.es)}
                    className="shrink-0 rounded-full p-2 hover:bg-secondary"
                    aria-label="Listen"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Button size="lg" className="w-full" onClick={() => setStage("practice")}>
          Start practice <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (stage === "practice" && current) {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Exercise {index + 1} of {exercises.length}
            </span>
            <span>{lesson.title}</span>
          </div>
          <Progress value={progressPct} />
        </div>
        <ExerciseRunner
          key={current.id}
          exercise={current}
          askConfidence={index % 3 === 0}
          onDone={handleExerciseDone}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="rounded-full bg-success/10 p-3">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <div>
          <h2 className="font-serif-display text-2xl font-semibold">Lesson complete</h2>
          <p className="mt-1 text-muted-foreground">
            {summary.correct}/{summary.total} correct · +{summary.xp} XP
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm text-accent">
          <Sparkles className="h-4 w-4" /> Progress saved to your skill profile
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={levelHref}>Back to level</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              Continue to dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
