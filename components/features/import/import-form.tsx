"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { importContentAction } from "@/actions/import-actions";
import type { ContentImportSource } from "@prisma/client";

const SOURCE_TYPES: { value: ContentImportSource; label: string }[] = [
  { value: "ARTICLE", label: "Article" },
  { value: "YOUTUBE_TRANSCRIPT", label: "YouTube transcript" },
  { value: "VIDEO_TRANSCRIPT", label: "Video transcript" },
  { value: "MOVIE_DIALOGUE", label: "Movie dialogue" },
  { value: "PODCAST_TRANSCRIPT", label: "Podcast transcript" },
  { value: "NEWS", label: "News" },
  { value: "OTHER", label: "Other" },
];

export function ImportForm() {
  const [sourceType, setSourceType] = useState<ContentImportSource>("ARTICLE");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    startTransition(async () => {
      const id = await importContentAction(sourceType, rawText, title);
      router.push(`/import/${id}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Paste content to learn from</CardTitle>
        <CardDescription>An article, transcript, or dialogue — we'll extract vocabulary, expressions, and grammar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Source type</Label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as ContentImportSource)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Noticias de hoy" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Text</Label>
          <Textarea rows={10} value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Pega el texto en español aquí…" />
        </div>
        <Button className="w-full" disabled={pending || rawText.trim().length < 20} onClick={handleSubmit}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Analyze
        </Button>
      </CardContent>
    </Card>
  );
}
