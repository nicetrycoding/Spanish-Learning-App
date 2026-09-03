"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mic, Volume2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptionCard } from "@/components/features/onboarding/option-card";
import { submitExerciseAction } from "@/actions/exercise-actions";
import { speakSpanish } from "@/lib/speech";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import type { ConfidenceLevel } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface RunnerExercise {
  id: string;
  type: string;
  prompt: string;
  data: any;
  explanation: string;
  cefrLevel: string;
  skillTag: string;
}

interface ExerciseRunnerProps {
  exercise: RunnerExercise;
  askConfidence?: boolean;
  onDone: (result: { isCorrect: boolean; xpEarned: number }) => void;
  /** Defaults to the generic exercise-submission action; pass a wrapper (e.g. grammar-topic practice) to also update other records. */
  onSubmit?: (input: { exerciseId: string; userAnswer: unknown; confidence?: ConfidenceLevel }) => Promise<{ isCorrect: boolean; xpEarned: number }>;
}

const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: "NOT_SURE", label: "Not sure" },
  { value: "SOMEWHAT_SURE", label: "Somewhat sure" },
  { value: "VERY_SURE", label: "Very sure" },
];

export function ExerciseRunner({ exercise, askConfidence, onDone, onSubmit = submitExerciseAction }: ExerciseRunnerProps) {
  const [answer, setAnswer] = useState<any>(initAnswer(exercise.type));
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [phase, setPhase] = useState<"answering" | "confidence" | "submitting" | "feedback">("answering");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; xpEarned: number } | null>(null);

  const ready = isAnswerReady(exercise.type, answer);

  async function handleSubmit() {
    if (askConfidence && confidence === null && phase !== "confidence") {
      setPhase("confidence");
      return;
    }
    setPhase("submitting");
    const result = await onSubmit({
      exerciseId: exercise.id,
      userAnswer: answer,
      confidence: confidence ?? undefined,
    });
    setFeedback(result);
    setPhase("feedback");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription>{formatExerciseType(exercise.type)}</CardDescription>
          <Badge variant="secondary">{exercise.cefrLevel}</Badge>
        </div>
        <CardTitle className="font-serif-display text-xl leading-snug">{exercise.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase !== "confidence" && (
          <ExerciseInput type={exercise.type} data={exercise.data} value={answer} onChange={setAnswer} disabled={phase !== "answering"} />
        )}

        {phase === "confidence" && (
          <div className="space-y-3">
            <p className="text-sm font-medium">How sure were you about that answer?</p>
            <div className="grid grid-cols-3 gap-2">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={confidence === opt.value}
                  onClick={() => setConfidence(opt.value)}
                  title={opt.label}
                  className="justify-center text-center"
                />
              ))}
            </div>
          </div>
        )}

        {phase === "feedback" && feedback && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-md p-4 text-sm",
              feedback.isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {feedback.isCorrect ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
            <div className="space-y-1">
              <p className="font-medium">{feedback.isCorrect ? "Correct!" : "Not quite"}</p>
              <p className="text-foreground/80">{exercise.explanation}</p>
              <p className="text-xs text-muted-foreground">+{feedback.xpEarned} XP</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {phase === "answering" && (
            <Button disabled={!ready} onClick={handleSubmit}>
              Submit
            </Button>
          )}
          {phase === "confidence" && (
            <Button disabled={confidence === null} onClick={handleSubmit}>
              Continue
            </Button>
          )}
          {phase === "submitting" && (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin" /> Checking…
            </Button>
          )}
          {phase === "feedback" && feedback && (
            <Button onClick={() => onDone(feedback)}>Continue</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatExerciseType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function initAnswer(type: string): any {
  switch (type) {
    case "MATCHING":
      return { matches: {} };
    case "SENTENCE_ORDER":
      return { order: [] };
    case "READING_COMPREHENSION":
    case "LISTENING_COMPREHENSION":
      return { answers: {} };
    case "FLASHCARD":
      return { knewIt: undefined };
    case "TRANSLATION":
    case "FILL_BLANK":
    case "SENTENCE_TRANSFORM":
    case "ERROR_CORRECTION":
    case "DICTATION":
    case "WRITING_PROMPT":
      return { text: "" };
    case "SPEAKING_PROMPT":
      return { text: "", audioCaptured: false };
    default:
      return { selectedIndex: null };
  }
}

function isAnswerReady(type: string, answer: any): boolean {
  switch (type) {
    case "MATCHING":
      return Object.keys(answer?.matches ?? {}).length > 0;
    case "SENTENCE_ORDER":
      return (answer?.order?.length ?? 0) > 0;
    case "READING_COMPREHENSION":
    case "LISTENING_COMPREHENSION":
      return Object.keys(answer?.answers ?? {}).length > 0;
    case "FLASHCARD":
      return answer?.knewIt !== undefined;
    case "TRANSLATION":
    case "FILL_BLANK":
    case "SENTENCE_TRANSFORM":
    case "ERROR_CORRECTION":
    case "DICTATION":
    case "WRITING_PROMPT":
      return (answer?.text?.trim()?.length ?? 0) > 0;
    case "SPEAKING_PROMPT":
      return (answer?.text?.trim()?.length ?? 0) > 0;
    default:
      return answer?.selectedIndex !== null && answer?.selectedIndex !== undefined;
  }
}

function ExerciseInput({
  type,
  data,
  value,
  onChange,
  disabled,
}: {
  type: string;
  data: any;
  value: any;
  onChange: (v: any) => void;
  disabled: boolean;
}) {
  switch (type) {
    case "MULTIPLE_CHOICE":
    case "CONTEXTUAL_SELECT":
    case "TENSE_SELECT":
    case "MISSING_WORD": {
      const question = data.question ?? data.context ?? data.sentence;
      return (
        <div className="space-y-3">
          {data.context && <p className="rounded-md bg-muted p-3 text-sm">{data.context}</p>}
          {question && data.question !== question && <p className="text-sm text-muted-foreground">{question}</p>}
          <div className="grid gap-2">
            {data.options.map((opt: string, idx: number) => (
              <OptionCard
                key={opt}
                selected={value.selectedIndex === idx}
                onClick={() => !disabled && onChange({ selectedIndex: idx })}
                title={opt}
              />
            ))}
          </div>
        </div>
      );
    }

    case "FLASHCARD":
      return <FlashcardInput data={data} value={value} onChange={onChange} disabled={disabled} />;

    case "MATCHING":
      return <MatchingInput data={data} value={value} onChange={onChange} disabled={disabled} />;

    case "TRANSLATION":
      return (
        <div className="space-y-2">
          <p className="rounded-md bg-muted p-3 font-serif-display text-base">{data.source}</p>
          <Textarea
            value={value.text}
            onChange={(e) => onChange({ text: e.target.value })}
            disabled={disabled}
            placeholder={data.direction === "es-en" ? "Translate to English…" : "Traduce al español…"}
          />
        </div>
      );

    case "FILL_BLANK":
    case "SENTENCE_TRANSFORM":
    case "ERROR_CORRECTION":
      return (
        <div className="space-y-2">
          <p className="rounded-md bg-muted p-3 font-serif-display text-base">
            {data.sentence ?? data.source ?? data.sentenceWithError}
          </p>
          {data.wordBank && (
            <div className="flex flex-wrap gap-1.5">
              {data.wordBank.map((w: string) => (
                <Badge key={w} variant="outline">
                  {w}
                </Badge>
              ))}
            </div>
          )}
          <Textarea value={value.text} onChange={(e) => onChange({ text: e.target.value })} disabled={disabled} placeholder="Escribe tu respuesta…" />
        </div>
      );

    case "SENTENCE_ORDER":
      return <SentenceOrderInput words={data.words} value={value.order} onChange={(order) => onChange({ order })} disabled={disabled} />;

    case "READING_COMPREHENSION":
      return (
        <ComprehensionInput
          passage={data.passageEs}
          questions={data.questions}
          value={value.answers}
          onChange={(answers) => onChange({ answers })}
          disabled={disabled}
        />
      );

    case "LISTENING_COMPREHENSION":
      return (
        <ComprehensionInput
          transcript={data.transcriptEs}
          questions={data.questions}
          value={value.answers}
          onChange={(answers) => onChange({ answers })}
          disabled={disabled}
        />
      );

    case "DICTATION":
      return (
        <div className="space-y-2">
          <Button type="button" variant="outline" onClick={() => speakSpanish(data.audioText)}>
            <Volume2 className="h-4 w-4" /> Play audio
          </Button>
          <Textarea
            value={value.text}
            onChange={(e) => onChange({ text: e.target.value })}
            disabled={disabled}
            placeholder="Escribe exactamente lo que escuchas…"
          />
        </div>
      );

    case "WRITING_PROMPT":
      return (
        <div className="space-y-2">
          {data.promptEn && <p className="text-sm text-muted-foreground">{data.promptEn}</p>}
          <Textarea
            rows={5}
            value={value.text}
            onChange={(e) => onChange({ text: e.target.value })}
            disabled={disabled}
            placeholder="Escribe en español…"
          />
          <p className="text-xs text-muted-foreground">Aim for at least {data.minWords ?? 20} words.</p>
        </div>
      );

    case "SPEAKING_PROMPT":
      return <SpeakingInput data={data} value={value} onChange={onChange} disabled={disabled} />;

    default:
      return null;
  }
}

function FlashcardInput({ data, value, onChange, disabled }: { data: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-32 w-full items-center justify-center rounded-lg border border-border bg-muted p-6 text-center font-serif-display text-xl"
      >
        {flipped ? data.back : data.front}
      </button>
      <p className="text-center text-xs text-muted-foreground">Tap the card to flip it</p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={value.knewIt === false ? "default" : "outline"}
          disabled={disabled}
          onClick={() => onChange({ knewIt: false })}
        >
          Didn't know it
        </Button>
        <Button
          type="button"
          variant={value.knewIt === true ? "default" : "outline"}
          disabled={disabled}
          onClick={() => onChange({ knewIt: true })}
        >
          Knew it
        </Button>
      </div>
    </div>
  );
}

function MatchingInput({ data, value, onChange, disabled }: { data: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const matches: Record<string, string> = value.matches ?? {};
  const matchedRights = new Set(Object.values(matches));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {data.pairs.map((p: { left: string; right: string }) => (
          <button
            key={p.left}
            type="button"
            disabled={disabled || Boolean(matches[p.left])}
            onClick={() => setSelectedLeft(p.left)}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-left text-sm",
              matches[p.left] ? "border-success bg-success/10" : selectedLeft === p.left ? "border-primary bg-primary/10" : "border-border",
            )}
          >
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {data.pairs.map((p: { left: string; right: string }) => (
          <button
            key={p.right}
            type="button"
            disabled={disabled || matchedRights.has(p.right) || !selectedLeft}
            onClick={() => {
              if (!selectedLeft) return;
              onChange({ matches: { ...matches, [selectedLeft]: p.right } });
              setSelectedLeft(null);
            }}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-left text-sm",
              matchedRights.has(p.right) ? "border-success bg-success/10 opacity-60" : "border-border hover:bg-muted",
            )}
          >
            {p.right}
          </button>
        ))}
      </div>
    </div>
  );
}

function SentenceOrderInput({
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
  const used = new Set(value ?? []);
  return (
    <div className="space-y-3">
      <div className="flex min-h-12 flex-wrap gap-2 rounded-md border border-dashed border-border p-3">
        {(value ?? []).length === 0 && <span className="text-sm text-muted-foreground">Tap words in order…</span>}
        {(value ?? []).map((idx, pos) => (
          <button
            key={pos}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value.filter((_, i) => i !== pos))}
            className="rounded-md bg-primary px-2.5 py-1 text-sm text-primary-foreground"
          >
            {words[idx]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((w, idx) =>
          used.has(idx) ? null : (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onChange([...(value ?? []), idx])}
              className="rounded-md border border-border bg-card px-2.5 py-1 text-sm hover:bg-muted"
            >
              {w}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function ComprehensionInput({
  passage,
  transcript,
  questions,
  value,
  onChange,
  disabled,
}: {
  passage?: string;
  transcript?: string;
  questions: { id: string; question: string; options: string[] }[];
  value: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      {passage && <p className="rounded-md bg-muted p-4 font-serif-display leading-relaxed">{passage}</p>}
      {transcript && (
        <Button type="button" variant="outline" onClick={() => speakSpanish(transcript)}>
          <Volume2 className="h-4 w-4" /> Play audio
        </Button>
      )}
      {questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-medium">{q.question}</p>
          <div className="grid gap-1.5">
            {q.options.map((opt, idx) => (
              <OptionCard
                key={opt}
                selected={value[q.id] === idx}
                onClick={() => !disabled && onChange({ ...value, [q.id]: idx })}
                title={opt}
                className="py-2.5"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpeakingInput({ data, value, onChange, disabled }: { data: any; value: any; onChange: (v: any) => void; disabled: boolean }) {
  const { transcript, isRecording, start, stop, supported } = useSpeechRecognition();

  function handleStop() {
    stop();
    onChange({ text: transcript, audioCaptured: true });
  }

  return (
    <div className="space-y-3">
      {data.promptEn && <p className="text-sm text-muted-foreground">{data.promptEn}</p>}
      <Button type="button" variant="outline" onClick={() => speakSpanish(data.promptEs)}>
        <Volume2 className="h-4 w-4" /> Hear it
      </Button>
      {supported ? (
        <div className="space-y-2">
          <Button type="button" variant={isRecording ? "destructive" : "default"} disabled={disabled} onClick={isRecording ? handleStop : start}>
            <Mic className="h-4 w-4" /> {isRecording ? "Stop recording" : "Record my answer"}
          </Button>
          {(transcript || value.text) && (
            <p className="rounded-md bg-muted p-3 text-sm italic">"{transcript || value.text}"</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Speech recognition isn't available in this browser — type what you'd say instead.
          </p>
          <Textarea value={value.text} onChange={(e) => onChange({ text: e.target.value })} disabled={disabled} />
        </div>
      )}
    </div>
  );
}
