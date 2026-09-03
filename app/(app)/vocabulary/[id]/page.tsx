import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getWordDetail } from "@/services/vocabulary-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WordDetailActions } from "@/components/features/vocabulary/word-detail-actions";
import { masteryLabel } from "@/lib/adaptive/mastery";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: id };
}

const REGION_LABEL: Record<string, string> = {
  SPAIN: "Spain",
  MEXICO: "Mexico",
  ARGENTINA: "Argentina",
  COLOMBIA: "Colombia",
  LATAM_GENERAL: "General Latin America",
};

export default async function WordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { vocabulary, userVocabulary } = await getWordDetail(session.user.id, id);
  if (!vocabulary) notFound();

  const components = userVocabulary
    ? [
        { label: "Exposure", value: userVocabulary.exposure },
        { label: "Understanding", value: userVocabulary.understanding },
        { label: "Accuracy", value: userVocabulary.accuracy },
        { label: "Retention", value: userVocabulary.retention },
        { label: "Production", value: userVocabulary.production },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif-display text-3xl font-semibold">{vocabulary.spanish}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{vocabulary.translation}</p>
          </div>
          <Badge variant="secondary">{vocabulary.cefrLevel}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline">{vocabulary.partOfSpeech}</Badge>
          {vocabulary.gender && <Badge variant="outline">{vocabulary.gender}</Badge>}
          {vocabulary.pronunciation && <Badge variant="outline">/{vocabulary.pronunciation}/</Badge>}
          <Badge variant="outline">{REGION_LABEL[vocabulary.region] ?? vocabulary.region}</Badge>
        </div>
      </div>

      <WordDetailActions vocabularyId={vocabulary.id} spanish={vocabulary.spanish} alreadySaved={Boolean(userVocabulary)} />

      {userVocabulary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Mastery — {Math.round(userVocabulary.mastery)}% ({masteryLabel(userVocabulary.mastery)})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {components.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">{c.label}</span>
                <Progress value={c.value} className="h-1.5 flex-1" />
                <span className="w-10 shrink-0 text-right text-xs">{Math.round(c.value)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="font-serif-display">{vocabulary.exampleEs}</p>
          <p className="text-sm text-muted-foreground">{vocabulary.exampleEn}</p>
        </CardContent>
      </Card>

      {vocabulary.collocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Common expressions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {vocabulary.collocations.map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {vocabulary.synonyms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Synonyms</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {vocabulary.synonyms.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}
        {vocabulary.antonyms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Antonyms</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {vocabulary.antonyms.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {vocabulary.relatedWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Related words</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {vocabulary.relatedWords.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {vocabulary.regionNotes && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-sm text-accent">Regional note</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{vocabulary.regionNotes}</CardContent>
        </Card>
      )}
    </div>
  );
}
