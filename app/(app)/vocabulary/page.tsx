import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getUserVocabulary, searchVocabulary } from "@/services/vocabulary-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/state-views";
import { VocabularyExplorer } from "@/components/features/vocabulary/vocabulary-explorer";
import { masteryLabel } from "@/lib/adaptive/mastery";

export const metadata: Metadata = { title: "Vocabulary" };

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [myVocab, exploreResults] = await Promise.all([getUserVocabulary(userId), searchVocabulary("", undefined, tag)]);
  const savedIds = new Set(myVocab.map((v) => v.vocabularyId));
  const masteredCount = myVocab.filter((v) => v.status === "MASTERED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Vocabulary</h1>
        <p className="mt-1 text-muted-foreground">
          {masteredCount} / {myVocab.length || 0} words mastered
        </p>
      </div>

      <Tabs defaultValue={tag ? "explore" : "my"}>
        <TabsList>
          <TabsTrigger value="my">My words ({myVocab.length})</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {myVocab.length === 0 ? (
            <EmptyState
              title="No words saved yet"
              description="Save words as you encounter them in lessons, or browse the Explore tab to add some now."
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {myVocab.map((uv) => (
                <Link key={uv.id} href={`/vocabulary/${uv.vocabularyId}`}>
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="space-y-2 py-4">
                      <div className="flex items-center justify-between">
                        <p className="font-serif-display text-base">{uv.vocabulary.spanish}</p>
                        <Badge variant="secondary">{uv.vocabulary.cefrLevel}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{uv.vocabulary.translation}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={uv.mastery} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{masteryLabel(uv.mastery)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="explore">
          <VocabularyExplorer initialResults={exploreResults} savedIds={savedIds} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
