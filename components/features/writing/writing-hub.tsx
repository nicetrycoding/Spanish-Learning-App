"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WritingComposer } from "@/components/features/writing/writing-composer";
import { writingPromptsByLevel, type WritingPrompt } from "@/lib/writing/prompts";

export function WritingHub() {
  const [active, setActive] = useState<WritingPrompt | null>(null);
  const groups = writingPromptsByLevel();

  if (active) {
    return <WritingComposer prompt={active} onCancel={() => setActive(null)} />;
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.level}>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            <Badge variant="secondary">{group.level}</Badge>
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.prompts.map((p) => (
              <Card key={p.id} className="cursor-pointer transition-colors hover:border-primary/40" onClick={() => setActive(p)}>
                <CardContent className="space-y-1 py-4">
                  <p className="font-serif-display">{p.promptEs}</p>
                  <p className="text-sm text-muted-foreground">{p.promptEn}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
