"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, PartyPopper, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { chooseStoryOptionAction } from "@/actions/story-actions";
import { speakSpanish } from "@/lib/speech";

interface StoryStep {
  stepKey: string;
  speaker: string | null;
  textEs: string;
  textEn: string;
  choices: { label: string; nextStepKey: string }[];
  isEnding: boolean;
  vocabHighlights: { es: string; en: string }[];
}

export function StoryRunner({
  storyId,
  steps,
  initialStepKey,
  title,
}: {
  storyId: string;
  steps: StoryStep[];
  initialStepKey: string;
  title: string;
}) {
  const [currentKey, setCurrentKey] = useState(initialStepKey);
  const [pending, startTransition] = useTransition();
  const [visitedVocab, setVisitedVocab] = useState<{ es: string; en: string }[]>([]);
  const [finished, setFinished] = useState(false);

  const step = steps.find((s) => s.stepKey === currentKey);

  if (!step) {
    return <p className="text-sm text-muted-foreground">This story path couldn't be found.</p>;
  }

  function handleChoice(choice: { label: string; nextStepKey: string }) {
    startTransition(async () => {
      const result = await chooseStoryOptionAction(storyId, choice.nextStepKey, choice.label);
      setVisitedVocab((v) => [...v, ...step!.vocabHighlights]);
      setCurrentKey(result.nextStep.stepKey);
      if (result.completed) setFinished(true);
    });
  }

  if (finished) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <div className="mx-auto w-fit rounded-full bg-success/10 p-3">
            <PartyPopper className="h-6 w-6 text-success" />
          </div>
          <h2 className="font-serif-display text-xl font-semibold">Story complete</h2>
          <p className="rounded-md bg-muted p-4 font-serif-display">{step.textEs}</p>
          {visitedVocab.length > 0 && (
            <div className="space-y-2 text-left">
              <p className="text-sm font-medium">Vocabulary from this story</p>
              <div className="flex flex-wrap gap-1.5">
                {visitedVocab.map((v, i) => (
                  <Badge key={i} variant="outline">
                    {v.es} — {v.en}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Button asChild>
            <Link href="/stories">Back to stories</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <Card>
        <CardContent className="space-y-4 pt-6">
          {step.speaker && <p className="text-xs font-medium text-muted-foreground">{step.speaker}</p>}
          <div className="flex items-start justify-between gap-2">
            <p className="font-serif-display text-lg leading-relaxed">{step.textEs}</p>
            <button onClick={() => speakSpanish(step.textEs)} className="shrink-0 rounded-full p-1.5 hover:bg-secondary" aria-label="Listen">
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{step.textEn}</p>

          <div className="space-y-2 pt-2">
            {step.choices.map((choice) => (
              <Button
                key={choice.label}
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                disabled={pending}
                onClick={() => handleChoice(choice)}
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {choice.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
