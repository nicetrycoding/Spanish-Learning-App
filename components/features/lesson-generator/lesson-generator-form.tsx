"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateCustomLessonAction } from "@/actions/import-actions";

const EXAMPLES = [
  "working in a restaurant",
  "a job interview",
  "renting an apartment",
  "talking to a doctor",
  "airport and travel",
];

export function LessonGeneratorForm() {
  const [topic, setTopic] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!topic.trim()) return;
    startTransition(() => generateCustomLessonAction(topic.trim()));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Teach me Spanish for…</CardTitle>
        <CardDescription>Describe a situation and get vocabulary, a dialogue, exercises, and a speaking/writing task.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. working in a restaurant" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setTopic(e)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              {e}
            </button>
          ))}
        </div>
        <Button className="w-full" disabled={pending || !topic.trim()} onClick={handleSubmit}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate lesson
        </Button>
      </CardContent>
    </Card>
  );
}
