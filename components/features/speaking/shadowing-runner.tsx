"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mic, PartyPopper, RotateCcw, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { speakSpanish } from "@/lib/speech";
import { completeShadowingSentenceAction } from "@/actions/shadowing-actions";
import type { ShadowingSentence } from "@/lib/speaking/prompts";

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;:]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

export function ShadowingRunner({ sentences }: { sentences: ShadowingSentence[] }) {
  const [index, setIndex] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const { transcript, isRecording, start, stop, supported, reset } = useSpeechRecognition();

  const sentence = sentences[index];

  const analysis = useMemo(() => {
    if (!analyzed || !sentence) return null;
    const target = normalizeWords(sentence.es);
    const said = new Set(normalizeWords(transcript));
    const missing = target.filter((w) => !said.has(w));
    const accuracy = target.length ? Math.round(((target.length - missing.length) / target.length) * 100) : 0;
    return { missing, accuracy };
  }, [analyzed, sentence, transcript]);

  if (!sentence) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="rounded-full bg-success/10 p-3">
            <PartyPopper className="h-6 w-6 text-success" />
          </div>
          <h2 className="font-serif-display text-xl font-semibold">Shadowing set complete</h2>
          <Button asChild>
            <Link href="/speaking">Back to speaking</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  function handleAnalyze() {
    stop();
    setAnalyzed(true);
    if (analysis) void completeShadowingSentenceAction(analysis.accuracy);
  }

  function handleNext() {
    setIndex((i) => i + 1);
    setAnalyzed(false);
    reset();
  }

  return (
    <div className="space-y-4">
      <Progress value={(index / sentences.length) * 100} />
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">
              {sentence.level}
            </Badge>
            <p className="font-serif-display text-2xl">{sentence.es}</p>
            <p className="mt-1 text-sm text-muted-foreground">{sentence.en}</p>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => speakSpanish(sentence.es, { rate: 0.75 })}>
              <Volume2 className="h-4 w-4" /> Slow
            </Button>
            <Button variant="outline" onClick={() => speakSpanish(sentence.es, { rate: 1 })}>
              <Volume2 className="h-4 w-4" /> Normal
            </Button>
          </div>

          {supported ? (
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? handleAnalyze : start}
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop & compare" : "Record yourself"}
              </Button>
              {transcript && <p className="rounded-md bg-muted p-3 text-center text-sm italic">"{transcript}"</p>}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Speech recognition isn't available in this browser.
            </p>
          )}

          {analysis && (
            <div className="space-y-2 rounded-md border border-border p-4 text-sm">
              <p className="font-medium">Word match: {analysis.accuracy}%</p>
              {analysis.missing.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missing.map((w) => (
                    <Badge key={w} variant="warning">
                      {w}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-success">All words matched.</p>
              )}
              <p className="text-xs text-muted-foreground">
                Word-accuracy is measured from your transcript; pronunciation and rhythm scoring needs audio analysis
                beyond what a browser transcript can capture.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                reset();
                setAnalyzed(false);
              }}
            >
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
            <Button className="flex-1" onClick={handleNext} disabled={!analyzed}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
