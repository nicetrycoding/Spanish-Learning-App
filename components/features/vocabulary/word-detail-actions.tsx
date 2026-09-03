"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveWordAction } from "@/actions/vocabulary-actions";
import { speakSpanish } from "@/lib/speech";

export function WordDetailActions({
  vocabularyId,
  spanish,
  alreadySaved,
}: {
  vocabularyId: string;
  spanish: string;
  alreadySaved: boolean;
}) {
  const [saved, setSaved] = useState(alreadySaved);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => speakSpanish(spanish)}>
        <Volume2 className="h-4 w-4" /> Listen
      </Button>
      {saved ? (
        <>
          <Button variant="secondary" disabled>
            <Check className="h-4 w-4" /> Saved
          </Button>
          <Button asChild variant="outline">
            <Link href="/practice/review">Practice this word</Link>
          </Button>
        </>
      ) : (
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await saveWordAction(vocabularyId);
              setSaved(true);
            })
          }
        >
          <BookmarkPlus className="h-4 w-4" /> Save word
        </Button>
      )}
    </div>
  );
}
