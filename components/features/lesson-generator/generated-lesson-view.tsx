"use client";

import { useState } from "react";
import { CheckCircle2, Volume2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { speakSpanish } from "@/lib/speech";
import type { GeneratedLessonContent } from "@/lib/ai/schemas";

export function GeneratedLessonView({ content }: { content: GeneratedLessonContent }) {
  return (
    <div className="space-y-6">
      {content.vocabulary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vocabulary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {content.vocabulary.map((v, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <div>
                  <p className="font-serif-display">{v.es}</p>
                  <p className="text-sm text-muted-foreground">
                    {v.en} · <span className="italic">{v.example}</span>
                  </p>
                </div>
                <button onClick={() => speakSpanish(v.es)} className="rounded-full p-1.5 hover:bg-secondary" aria-label="Listen">
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {content.grammarNote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grammar note</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">{content.grammarNote}</CardContent>
        </Card>
      )}

      {content.dialogue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dialogue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {content.dialogue.map((line, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <Badge variant="outline" className="shrink-0">
                  {line.speaker}
                </Badge>
                <div>
                  <p className="font-serif-display">{line.es}</p>
                  <p className="text-xs text-muted-foreground">{line.en}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {content.listeningTask && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listening task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={() => speakSpanish(content.listeningTask.transcriptEs)}>
              <Volume2 className="h-4 w-4" /> Play
            </Button>
            <ListeningCheck question={content.listeningTask.question} answer={content.listeningTask.answer} />
          </CardContent>
        </Card>
      )}

      {content.exercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.exercises.map((ex, i) => (
              <MiniExercise key={i} exercise={ex} />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {content.speakingTask && (
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-sm text-accent">Speaking task</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">{content.speakingTask}</CardContent>
          </Card>
        )}
        {content.writingTask && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm text-primary">Writing task</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">{content.writingTask}</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ListeningCheck({ question, answer }: { question: string; answer: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium">{question}</p>
      {revealed ? (
        <p className="text-success">{answer}</p>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setRevealed(true)}>
          Show answer
        </Button>
      )}
    </div>
  );
}

function MiniExercise({
  exercise,
}: {
  exercise: GeneratedLessonContent["exercises"][number];
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  const isCorrect =
    exercise.type === "MULTIPLE_CHOICE"
      ? selected === exercise.correctIndex
      : (exercise.acceptableAnswers ?? []).some((a) => a.trim().toLowerCase() === text.trim().toLowerCase());

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <p className="text-sm font-medium">{exercise.prompt}</p>
      {exercise.type === "MULTIPLE_CHOICE" && exercise.options ? (
        <div className="grid gap-1.5">
          {exercise.options.map((opt, idx) => (
            <button
              key={opt}
              onClick={() => !checked && setSelected(idx)}
              className={`rounded-md border px-2.5 py-1.5 text-left text-sm ${
                checked && idx === exercise.correctIndex
                  ? "border-success bg-success/10"
                  : checked && idx === selected
                    ? "border-destructive bg-destructive/10"
                    : selected === idx
                      ? "border-primary bg-primary/5"
                      : "border-border"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <input
          className="w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={checked}
        />
      )}
      {!checked ? (
        <Button size="sm" onClick={() => setChecked(true)}>
          Check
        </Button>
      ) : (
        <p className={`flex items-center gap-1.5 text-sm ${isCorrect ? "text-success" : "text-destructive"}`}>
          {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {exercise.explanation}
        </p>
      )}
    </div>
  );
}
