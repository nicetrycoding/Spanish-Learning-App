"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createInitialAbility,
  nextStep,
  updateAbility,
  computeResult,
  type AbilityState,
  type PlacementAnswer,
} from "@/lib/placement/engine";
import { gradePlacementAnswer } from "@/lib/placement/grading";
import { WRITING_PROMPT, type PlacementItem } from "@/lib/placement/item-bank";
import { estimateWritingLevel } from "@/lib/placement/writing-estimate";
import { speakSpanish } from "@/lib/speech";
import { submitPlacementTestAction } from "@/actions/onboarding-actions";
import { OptionCard } from "@/components/features/onboarding/option-card";
import type { CEFRLevelKey } from "@/lib/cefr";

type Stage = "testing" | "writing" | "submitting";

const TOTAL_ESTIMATED_ITEMS = 22; // ~4 skills x ~5-6 items, used only for the progress bar

interface PlacementTestRunnerProps {
  /** Defaults to the onboarding placement-test flow; pass a variant (e.g. a level-completion assessment) to reuse this same adaptive engine elsewhere. */
  onSubmit?: (
    result: ReturnType<typeof computeResult>,
    responses: PlacementAnswer[],
    writing: { level: CEFRLevelKey; sub: number },
  ) => Promise<void>;
}

export function PlacementTestRunner({ onSubmit = submitPlacementTestAction }: PlacementTestRunnerProps) {
  const [askedIds, setAskedIds] = useState<Set<string>>(new Set());
  const [ability, setAbility] = useState<AbilityState>(createInitialAbility());
  const [answers, setAnswers] = useState<PlacementAnswer[]>([]);
  const [stage, setStage] = useState<Stage>("testing");
  const [writingText, setWritingText] = useState("");
  const [pending, startTransition] = useTransition();

  // Per-item interaction state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [orderChoice, setOrderChoice] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // nextStep() re-derives which skill we're on from `answers`/`askedIds` on
  // every call (walking past any skill that has already converged), so we
  // always start the scan at skill index 0 — no separate index to track.
  const step = useMemo(
    () => nextStep({ currentSkillIndex: 0, askedIds, ability, answers }),
    [askedIds, ability, answers],
  );

  function resetItemState() {
    setSelectedIndex(null);
    setTextAnswer("");
    setOrderChoice([]);
    setRevealed(false);
    setLastCorrect(null);
  }

  function submitAnswer(item: PlacementItem, rawAnswer: unknown) {
    const isCorrect = gradePlacementAnswer(item, rawAnswer);
    setLastCorrect(isCorrect);
    setRevealed(true);

    const newAbility: AbilityState = {
      bySkill: {
        ...ability.bySkill,
        [item.skill]: updateAbility(ability.bySkill[item.skill], item.difficulty, isCorrect),
      },
    };
    const answer: PlacementAnswer = {
      itemId: item.id,
      skill: item.skill,
      difficulty: item.difficulty,
      isCorrect,
      userAnswer: rawAnswer,
    };

    // Delay the advance slightly so the learner sees correct/incorrect feedback.
    setTimeout(() => {
      setAbility(newAbility);
      setAnswers((prev) => [...prev, answer]);
      setAskedIds((prev) => new Set(prev).add(item.id));
      resetItemState();
    }, 700);
  }

  useEffect(() => {
    if (stage === "testing" && step.done) {
      setStage("writing");
    }
  }, [stage, step.done]);

  function handleFinalSubmit() {
    setStage("submitting");
    const result = computeResult(ability, answers);
    const writing = estimateWritingLevel(writingText);
    startTransition(async () => {
      await onSubmit(result, answers, { level: writing.level, sub: writing.sub });
    });
  }

  if (stage === "testing") {
    if (step.done || !step.item) {
      // The effect above advances to the writing stage; render a brief
      // loading state for the one frame in between.
      return <LoadingCard label="Finishing up the objective section…" />;
    }

    const item = step.item;
    const progressPct = Math.min(100, (answers.length / TOTAL_ESTIMATED_ITEMS) * 100);

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {answers.length + 1}</span>
            <Badge variant="secondary">{item.skill.charAt(0) + item.skill.slice(1).toLowerCase()}</Badge>
          </div>
          <Progress value={progressPct} />
        </div>

        <Card>
          <CardHeader>
            <CardDescription>Adaptive placement test</CardDescription>
            <CardTitle className="font-serif-display text-xl leading-snug">{item.instruction}</CardTitle>
            {item.contextEn && <CardDescription>{item.contextEn}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            {item.passage && (
              <p className="rounded-md bg-muted p-4 font-serif-display text-base leading-relaxed">{item.passage}</p>
            )}

            {item.transcript && (
              <Button
                type="button"
                variant="outline"
                onClick={() => speakSpanish(item.transcript!, { rate: item.difficulty > 3 ? 1 : 0.85 })}
                className="w-full sm:w-auto"
              >
                <Volume2 className="h-4 w-4" /> Play audio
              </Button>
            )}

            {(item.format === "multiple_choice" || item.format === "fill_blank" || item.format === "reading" || item.format === "listening") &&
              item.options && (
                <div className="grid gap-2">
                  {item.options.map((opt, idx) => (
                    <OptionCard
                      key={opt}
                      selected={selectedIndex === idx}
                      onClick={() => !revealed && setSelectedIndex(idx)}
                      title={opt}
                      className={
                        revealed
                          ? idx === item.correctIndex
                            ? "border-success bg-success/10"
                            : idx === selectedIndex
                              ? "border-destructive bg-destructive/10"
                              : ""
                          : ""
                      }
                    />
                  ))}
                </div>
              )}

            {(item.format === "translation" || item.format === "error_correction") && (
              <Textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Escribe tu respuesta en español…"
                disabled={revealed}
              />
            )}

            {item.format === "sentence_order" && item.words && (
              <SentenceOrderBuilder words={item.words} value={orderChoice} onChange={setOrderChoice} disabled={revealed} />
            )}

            {revealed && (
              <p className={lastCorrect ? "text-sm text-success" : "text-sm text-muted-foreground"}>
                {lastCorrect ? "Correct. " : "Not quite. "}
                {item.explanation}
              </p>
            )}

            {!revealed && (
              <Button
                className="w-full"
                disabled={!isAnswerReady(item, selectedIndex, textAnswer, orderChoice)}
                onClick={() =>
                  submitAnswer(
                    item,
                    item.format === "sentence_order"
                      ? { order: orderChoice }
                      : item.format === "translation" || item.format === "error_correction"
                        ? { text: textAnswer }
                        : { selectedIndex },
                  )
                }
              >
                Submit answer
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === "writing") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardDescription>Last step — free writing</CardDescription>
            <CardTitle className="font-serif-display text-xl">{WRITING_PROMPT.promptEs}</CardTitle>
            <CardDescription>{WRITING_PROMPT.promptEn}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              placeholder="Escribe 2-3 frases…"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Write as much or as little as you can — even a few words is useful data. This step is
              never scored as pass/fail.
            </p>
            <Button className="w-full" onClick={handleFinalSubmit} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              See my results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <LoadingCard label="Calculating your Spanish skill profile…" />;
}

function LoadingCard({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function isAnswerReady(item: PlacementItem, selectedIndex: number | null, text: string, order: number[]) {
  if (item.format === "sentence_order") return order.length === (item.words?.length ?? 0);
  if (item.format === "translation" || item.format === "error_correction") return text.trim().length > 0;
  return selectedIndex !== null;
}

function SentenceOrderBuilder({
  words,
  value,
  onChange,
  disabled,
}: {
  words: string[];
  value: number[];
  onChange: (order: number[]) => void;
  disabled: boolean;
}) {
  const usedSet = new Set(value);
  return (
    <div className="space-y-3">
      <div className="flex min-h-12 flex-wrap gap-2 rounded-md border border-dashed border-border p-3">
        {value.length === 0 && <span className="text-sm text-muted-foreground">Tap words below in order…</span>}
        {value.map((idx, position) => (
          <button
            key={position}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value.filter((_, i) => i !== position))}
            className="rounded-md bg-primary px-2.5 py-1 text-sm text-primary-foreground"
          >
            {words[idx]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word, idx) =>
          usedSet.has(idx) ? null : (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onChange([...value, idx])}
              className="rounded-md border border-border bg-card px-2.5 py-1 text-sm hover:bg-muted"
            >
              {word}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
