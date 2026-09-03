"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, PartyPopper, Volume2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { OptionCard } from "@/components/features/onboarding/option-card";
import { submitReviewAction } from "@/actions/review-actions";
import { speakSpanish } from "@/lib/speech";
import type { ConfidenceLevel } from "@prisma/client";
import type { ReviewCard } from "@/services/review-service";

const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: "NOT_SURE", label: "Not sure" },
  { value: "SOMEWHAT_SURE", label: "Somewhat sure" },
  { value: "VERY_SURE", label: "Very sure" },
];

const TYPE_LABEL: Record<ReviewCard["type"], string> = {
  VOCABULARY: "Vocabulary",
  GRAMMAR: "Grammar",
  MISTAKE: "Past mistake",
};

export function ReviewRunner({ cards }: { cards: ReviewCard[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [selfGrade, setSelfGrade] = useState<boolean | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const card = cards[index];

  if (!card) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-full bg-success/10 p-3">
            <PartyPopper className="h-6 w-6 text-success" />
          </div>
          <h2 className="font-serif-display text-xl font-semibold">All caught up</h2>
          <p className="text-sm text-muted-foreground">
            You reviewed {completedCount} item{completedCount === 1 ? "" : "s"}. Nothing else is due right now.
          </p>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isProduction = card.mode === "production";

  function resetCard() {
    setRevealed(false);
    setTypedAnswer("");
    setConfidence(null);
    setSelfGrade(null);
  }

  async function submit(isCorrect: boolean) {
    setSelfGrade(isCorrect);
    setRevealed(true);
  }

  async function confirmAndAdvance() {
    if (selfGrade === null) return;
    await submitReviewAction({
      type: card.type,
      refId: card.refId,
      mode: card.mode,
      isCorrect: selfGrade,
      confidence: confidence ?? undefined,
    });
    setCompletedCount((c) => c + 1);
    setIndex((i) => i + 1);
    resetCard();
  }

  function checkTyped() {
    const normalize = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
    const isCorrect = normalize(typedAnswer) === normalize(card.back);
    submit(isCorrect);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {index + 1} of {cards.length}
          </span>
          <Badge variant="secondary">{TYPE_LABEL[card.type]}</Badge>
        </div>
        <Progress value={(index / cards.length) * 100} />
      </div>

      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg bg-muted p-6 text-center">
            <p className="font-serif-display text-2xl">{card.front}</p>
            {card.type === "VOCABULARY" && !isProduction && (
              <button type="button" onClick={() => speakSpanish(card.mode === "recognition" ? card.front : card.back)} className="rounded-full p-1.5 hover:bg-secondary">
                <Volume2 className="h-4 w-4" />
              </button>
            )}
            {card.type === "MISTAKE" && <p className="text-xs text-muted-foreground">What you wrote</p>}
          </div>

          {isProduction && !revealed && (
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">Type the Spanish word</p>
              <Input value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkTyped()} autoFocus />
              <Button className="w-full" onClick={checkTyped} disabled={!typedAnswer.trim()}>
                Check
              </Button>
            </div>
          )}

          {!isProduction && !revealed && (
            <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>
              Show answer
            </Button>
          )}

          {revealed && (
            <div className="space-y-4">
              <div
                className={
                  "flex items-start gap-3 rounded-md p-4 text-sm " +
                  (selfGrade ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")
                }
              >
                {selfGrade ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                <div>
                  <p className="font-medium">{card.back}</p>
                  {card.note && <p className="mt-0.5 text-foreground/70">{card.note}</p>}
                </div>
              </div>

              {!isProduction && (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={selfGrade === false ? "default" : "outline"} onClick={() => setSelfGrade(false)}>
                    Didn't know
                  </Button>
                  <Button variant={selfGrade === true ? "default" : "outline"} onClick={() => setSelfGrade(true)}>
                    Knew it
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-center text-xs text-muted-foreground">How confident were you?</p>
                <div className="grid grid-cols-3 gap-2">
                  {CONFIDENCE_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      selected={confidence === opt.value}
                      onClick={() => setConfidence(opt.value)}
                      title={opt.label}
                      className="justify-center py-2 text-center text-xs"
                    />
                  ))}
                </div>
              </div>

              <Button className="w-full" disabled={confidence === null} onClick={confirmAndAdvance}>
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
