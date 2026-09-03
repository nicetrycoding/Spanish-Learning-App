"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { explainMistakeAction } from "@/actions/mistake-actions";
import type { MistakeExplanation } from "@/lib/ai/schemas";

export function ExplainMistakeDialog({ mistakeId }: { mistakeId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<MistakeExplanation | null>(null);

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !explanation) {
      setLoading(true);
      const result = await explainMistakeAction(mistakeId);
      setExplanation(result);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-3.5 w-3.5" /> Explain my mistake
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Why was this wrong?</DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking it through…
          </div>
        )}
        {explanation && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-destructive">What was wrong</p>
              <p className="text-foreground/90">{explanation.whatWasWrong}</p>
            </div>
            <div>
              <p className="font-medium">Why</p>
              <p className="text-foreground/90">{explanation.why}</p>
            </div>
            <div>
              <p className="font-medium text-success">Correct form</p>
              <p className="text-foreground/90">{explanation.correctForm}</p>
            </div>
            {explanation.naturalAlternatives.length > 0 && (
              <div>
                <p className="font-medium">Natural alternatives</p>
                <ul className="list-inside list-disc text-foreground/90">
                  {explanation.naturalAlternatives.map((alt) => (
                    <li key={alt}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.similarExamples.length > 0 && (
              <div>
                <p className="font-medium">Similar examples</p>
                <div className="space-y-1.5">
                  {explanation.similarExamples.map((ex, i) => (
                    <div key={i} className="rounded-md bg-muted p-2">
                      <p className="font-serif-display">{ex.es}</p>
                      <p className="text-xs text-muted-foreground">{ex.en}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
