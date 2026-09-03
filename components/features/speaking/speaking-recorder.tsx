"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { speakSpanish } from "@/lib/speech";
import { submitSpeakingAction } from "@/actions/speaking-actions";
import type { SpeakingPrompt } from "@/lib/speaking/prompts";

export function SpeakingRecorder({ prompt, onCancel }: { prompt: SpeakingPrompt; onCancel: () => void }) {
  const { transcript, isRecording, start, stop, supported } = useSpeechRecognition();
  const [manualText, setManualText] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const finalText = (supported ? transcript : manualText).trim();

  function handleSubmit() {
    startTransition(async () => {
      const id = await submitSpeakingAction(prompt.promptEs, prompt.level, finalText);
      router.push(`/speaking/${id}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{prompt.level}</Badge>
          <button className="text-xs text-muted-foreground hover:underline" onClick={onCancel}>
            Choose a different prompt
          </button>
        </div>
        <CardTitle className="font-serif-display text-xl">{prompt.promptEs}</CardTitle>
        <p className="text-sm text-muted-foreground">{prompt.promptEn}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" onClick={() => speakSpanish(prompt.promptEs)}>
          <Volume2 className="h-4 w-4" /> Hear the prompt
        </Button>

        {supported ? (
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stop : start}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? "Stop recording" : "Start recording"}
            </Button>
            {transcript && <p className="rounded-md bg-muted p-3 text-sm italic">"{transcript}"</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Speech recognition isn't available in this browser. Type what you would say instead.
            </p>
            <Textarea value={manualText} onChange={(e) => setManualText(e.target.value)} rows={4} />
          </div>
        )}

        <Button className="w-full" disabled={!finalText || pending} onClick={handleSubmit}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Get feedback
        </Button>
      </CardContent>
    </Card>
  );
}
