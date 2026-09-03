import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Dumbbell } from "lucide-react";
import { auth } from "@/lib/auth";
import { getGrammarTopicDetail } from "@/services/grammar-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

const REGION_LABEL: Record<string, string> = {
  SPAIN: "Spain",
  MEXICO: "Mexico",
  ARGENTINA: "Argentina",
  COLOMBIA: "Colombia",
  LATAM_GENERAL: "General Latin America",
};

export default async function GrammarTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await getGrammarTopicDetail(slug, session.user.id);
  if (!result) notFound();
  const { topic, progress, relatedTopics } = result;

  const examples = topic.examples as { es: string; en: string; note?: string }[];
  const commonMistakes = topic.commonMistakes as { wrong: string; right: string; why: string }[];
  const exceptions = topic.exceptions as { rule: string; example: string }[];
  const regionalNotes = topic.regionalNotes as { region: string; note: string }[];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {topic.cefrLevel}
        </Badge>
        <h1 className="font-serif-display text-3xl font-semibold">{topic.title}</h1>
        <p className="mt-2 text-muted-foreground">{topic.summary}</p>
      </div>

      {progress && (
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Progress value={progress.mastery} className="h-2 flex-1" />
            <span className="shrink-0 text-sm font-medium">{Math.round(progress.mastery)}% mastery</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="whitespace-pre-line pt-6 leading-relaxed">{topic.explanation}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {examples.map((ex, i) => (
            <div key={i} className="rounded-md bg-muted p-3">
              <p className="font-serif-display">{ex.es}</p>
              <p className="text-sm text-muted-foreground">{ex.en}</p>
              {ex.note && <p className="mt-1 text-xs text-accent">{ex.note}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {commonMistakes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Common mistakes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {commonMistakes.map((m, i) => (
              <div key={i} className="space-y-1 rounded-md border border-border p-3 text-sm">
                <p className="text-destructive">❌ {m.wrong}</p>
                <p className="text-success">✅ {m.right}</p>
                <p className="text-muted-foreground">{m.why}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {exceptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exceptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exceptions.map((e, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{e.rule}</p>
                <p className="text-muted-foreground">{e.example}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {regionalNotes.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-sm text-accent">Regional differences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {regionalNotes.map((r, i) => (
              <p key={i}>
                <span className="font-medium">{REGION_LABEL[r.region] ?? r.region}:</span> {r.note}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {relatedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {relatedTopics.map((r) => (
            <Link key={r.slug} href={`/grammar/${r.slug}`}>
              <Badge variant="outline">{r.title}</Badge>
            </Link>
          ))}
        </div>
      )}

      <Button asChild size="lg" className="w-full">
        <Link href={`/grammar/${slug}/practice`}>
          <Dumbbell className="h-4 w-4" /> Practice this topic
        </Link>
      </Button>
    </div>
  );
}
