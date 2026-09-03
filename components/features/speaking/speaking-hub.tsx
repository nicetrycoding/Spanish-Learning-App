"use client";

import { useState } from "react";
import Link from "next/link";
import { Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakingRecorder } from "@/components/features/speaking/speaking-recorder";
import { speakingPromptsByLevel, type SpeakingPrompt } from "@/lib/speaking/prompts";

export function SpeakingHub() {
  const [active, setActive] = useState<SpeakingPrompt | null>(null);
  const groups = speakingPromptsByLevel();

  if (active) {
    return <SpeakingRecorder prompt={active} onCancel={() => setActive(null)} />;
  }

  return (
    <div className="space-y-8">
      <Link href="/speaking/shadowing">
        <Card className="border-2 border-accent/30 bg-accent/5 transition-colors hover:border-accent/50">
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/10 p-2.5 text-accent">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Shadowing mode</p>
                <p className="text-sm text-muted-foreground">Listen, repeat, and compare against native rhythm</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Start
            </Button>
          </CardContent>
        </Card>
      </Link>

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
