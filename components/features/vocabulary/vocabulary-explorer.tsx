"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/state-views";
import { searchVocabularyAction, saveWordAction } from "@/actions/vocabulary-actions";
import { CEFR_LEVELS } from "@/lib/cefr";

interface VocabResult {
  id: string;
  spanish: string;
  translation: string;
  partOfSpeech: string;
  cefrLevel: string;
}

export function VocabularyExplorer({ initialResults, savedIds }: { initialResults: VocabResult[]; savedIds: Set<string> }) {
  const [query, setQuery] = useState("");
  const [cefr, setCefr] = useState<string>("");
  const [results, setResults] = useState(initialResults);
  const [saved, setSaved] = useState(savedIds);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const data = await searchVocabularyAction(query, cefr);
        setResults(data as VocabResult[]);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, cefr]);

  async function handleSave(id: string) {
    setSaved((s) => new Set(s).add(id));
    await saveWordAction(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Spanish or English…" className="pl-9" />
        </div>
        <Select value={cefr || "all"} onValueChange={(v) => setCefr(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Any level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any level</SelectItem>
            {CEFR_LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {results.length === 0 && !pending ? (
        <EmptyState title="No words found" description="Try a different search term or level." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((word) => (
            <Card key={word.id}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <Link href={`/vocabulary/${word.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-serif-display text-base">{word.spanish}</p>
                  <p className="truncate text-sm text-muted-foreground">{word.translation}</p>
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{word.cefrLevel}</Badge>
                  <Button
                    size="icon"
                    variant={saved.has(word.id) ? "secondary" : "outline"}
                    onClick={() => handleSave(word.id)}
                    disabled={saved.has(word.id)}
                    aria-label="Save word"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
