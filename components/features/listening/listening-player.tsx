"use client";

import { useState } from "react";
import Link from "next/link";
import { PartyPopper, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptionCard } from "@/components/features/onboarding/option-card";
import { submitListeningAction } from "@/actions/listening-actions";
import { speakSpanish, regionToSpeechLang } from "@/lib/speech";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export function ListeningPlayer({
  exerciseId,
  transcriptEs,
  region,
  questions,
}: {
  exerciseId: string;
  transcriptEs: string;
  region: string;
  questions: Question[];
}) {
  const [rate, setRate] = useState(1);
  const [playCount, setPlayCount] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ comprehensionScore: number; missedExpressions: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function play(speed: number) {
    setRate(speed);
    setPlayCount((c) => c + 1);
    speakSpanish(transcriptEs, { rate: speed, lang: regionToSpeechLang(region) });
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await submitListeningAction(exerciseId, answers);
    setResult(res);
    setSubmitting(false);
  }

  if (result) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              {result.comprehensionScore >= 80 ? (
                <PartyPopper className="h-6 w-6 text-primary" />
              ) : (
                <Volume2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <p className="font-serif-display text-2xl font-semibold">Comprehension: {result.comprehensionScore}%</p>
          </div>
          {result.missedExpressions.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Missed expressions (added to your review queue):</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missedExpressions.map((e) => (
                  <Badge key={e} variant="warning">
                    {e}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Button asChild className="w-full">
            <Link href="/listening">Back to listening</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant={rate === 0.7 ? "default" : "outline"} onClick={() => play(0.7)}>
              <Volume2 className="h-4 w-4" /> Slow
            </Button>
            <Button variant={rate === 1 ? "default" : "outline"} onClick={() => play(1)}>
              <Volume2 className="h-4 w-4" /> Normal
            </Button>
            <Button variant={rate === 1.2 ? "default" : "outline"} onClick={() => play(1.2)}>
              <Volume2 className="h-4 w-4" /> Natural
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Played {playCount} time{playCount === 1 ? "" : "s"}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="space-y-3 pt-6">
              <p className="font-medium">{q.question}</p>
              <div className="grid gap-2">
                {q.options.map((opt, idx) => (
                  <OptionCard
                    key={opt}
                    selected={answers[q.id] === idx}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                    title={opt}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full" size="lg" disabled={Object.keys(answers).length < questions.length || submitting} onClick={handleSubmit}>
        {submitting ? "Checking…" : "Submit answers"}
      </Button>
    </div>
  );
}
