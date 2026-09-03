"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { startRoleplayAction } from "@/actions/conversation-actions";
import type { SpanishRegion, CEFRLevel, ImmersionLevel } from "@prisma/client";

interface Character {
  id: string;
  name: string;
  personality: string;
  region: SpanishRegion;
  difficulty: CEFRLevel;
  avatarEmoji: string;
  slug: string;
}

const REGION_LABEL: Record<string, string> = {
  SPAIN: "Spain",
  MEXICO: "Mexico",
  ARGENTINA: "Argentina",
  COLOMBIA: "Colombia",
  LATAM_GENERAL: "Latin America",
};

export function RoleplayHub({ characters, defaultImmersion }: { characters: Character[]; defaultImmersion: ImmersionLevel }) {
  const [immediateCorrections, setImmediateCorrections] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStart(character: Character) {
    setStartingId(character.id);
    startTransition(() =>
      startRoleplayAction({
        characterId: character.id,
        scenario: character.slug.replace(/-/g, " "),
        region: character.region,
        difficulty: character.difficulty,
        immersionLevel: defaultImmersion,
        correctionMode: immediateCorrections ? "immediate" : "after",
      }),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-3">
        <Switch id="immediate" checked={immediateCorrections} onCheckedChange={setImmediateCorrections} />
        <Label htmlFor="immediate" className="cursor-pointer text-sm">
          Correct me immediately (default: conversation first, feedback after)
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{c.avatarEmoji}</span>
                <Badge variant="secondary">{c.difficulty}</Badge>
              </div>
              <CardTitle className="text-base">{c.name}</CardTitle>
              <CardDescription>{c.personality}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant="outline">{REGION_LABEL[c.region] ?? c.region}</Badge>
              <Button size="sm" disabled={pending} onClick={() => handleStart(c)}>
                {pending && startingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
