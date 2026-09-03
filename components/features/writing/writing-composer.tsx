"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitWritingAction } from "@/actions/writing-actions";
import type { WritingPrompt } from "@/lib/writing/prompts";

export function WritingComposer({ prompt, onCancel }: { prompt: WritingPrompt; onCancel: () => void }) {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  function handleSubmit() {
    startTransition(async () => {
      const id = await submitWritingAction(prompt.promptEs, prompt.level, content);
      router.push(`/writing/${id}`);
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
      <CardContent className="space-y-3">
        <Textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe aquí…" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {wordCount} / {prompt.minWords} words
          </p>
          <Button onClick={handleSubmit} disabled={pending || wordCount === 0}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit for feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
