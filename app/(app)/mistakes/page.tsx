import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Dumbbell } from "lucide-react";
import { auth } from "@/lib/auth";
import { getMistakesGrouped, getResolvedMistakeCount } from "@/services/mistake-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/state-views";
import { ExplainMistakeDialog } from "@/components/features/mistakes/explain-mistake-dialog";
import { ResolveMistakeButton } from "@/components/features/mistakes/resolve-mistake-button";

export const metadata: Metadata = { title: "Mistakes" };

export default async function MistakesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [groups, resolvedCount] = await Promise.all([
    getMistakesGrouped(session.user.id),
    getResolvedMistakeCount(session.user.id),
  ]);

  const totalOpen = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Mistakes</h1>
        <p className="mt-1 text-muted-foreground">
          {totalOpen} open · {resolvedCount} resolved. Recurring mistakes automatically get targeted practice.
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No mistakes tracked yet"
          description="As you practice, anything you get wrong shows up here — categorized, explained, and turned into targeted practice if it keeps happening."
        />
      ) : (
        groups.map((group) => (
          <div key={group.category}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {group.label}
              <Badge variant="secondary">{group.items.length}</Badge>
            </h2>
            <div className="space-y-3">
              {group.items.map((mistake) => (
                <Card key={mistake.id}>
                  <CardContent className="space-y-3 pt-6">
                    <div className="space-y-1 text-sm">
                      <p className="text-destructive">❌ {mistake.userInput}</p>
                      <p className="text-success">✅ {mistake.correctForm}</p>
                      {mistake.explanation && <p className="text-muted-foreground">{mistake.explanation}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {mistake.occurrenceCount > 1 && (
                        <Badge variant="warning">Happened {mistake.occurrenceCount}×</Badge>
                      )}
                      <ExplainMistakeDialog mistakeId={mistake.id} />
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/mistakes/${mistake.id}/practice`}>
                          <Dumbbell className="h-3.5 w-3.5" /> Practice
                        </Link>
                      </Button>
                      <ResolveMistakeButton mistakeId={mistake.id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {resolvedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> You've resolved {resolvedCount} mistake{resolvedCount === 1 ? "" : "s"} so far.
        </div>
      )}
    </div>
  );
}
