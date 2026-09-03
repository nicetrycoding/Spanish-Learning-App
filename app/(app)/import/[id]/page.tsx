import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { getContentImport } from "@/services/content-import-service";
import type { ContentExtraction } from "@/lib/ai/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateLessonFromImportAction } from "@/actions/import-actions";

export const metadata: Metadata = { title: "Content analysis" };

export default async function ImportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const record = await getContentImport(session.user.id, id);
  if (!record) notFound();
  const extraction = record.extraction as unknown as ContentExtraction | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {record.cefrEstimate ?? "—"}
        </Badge>
        <h1 className="font-serif-display text-2xl font-semibold">{record.title}</h1>
      </div>

      {extraction && (
        <>
          <Card>
            <CardContent className="pt-6 text-sm leading-relaxed">{extraction.summaryEn}</CardContent>
          </Card>

          {extraction.vocabulary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vocabulary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {extraction.vocabulary.map((v, i) => (
                  <div key={i} className="rounded-md bg-muted px-2.5 py-1.5 text-sm">
                    <p className="font-medium">{v.es}</p>
                    <p className="text-xs text-muted-foreground">{v.en}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {extraction.expressions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expressions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {extraction.expressions.map((e, i) => (
                  <Badge key={i} variant="outline">
                    {e.es} — {e.en}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {extraction.grammarTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Grammar in this text</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {extraction.grammarTopics.map((g) => (
                  <Badge key={g} variant="secondary">
                    {g}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {extraction.culturalNotes.length > 0 && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-sm text-accent">Cultural notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {extraction.culturalNotes.map((n, i) => (
                  <p key={i}>{n}</p>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <form action={generateLessonFromImportAction.bind(null, record.id)}>
        <Button type="submit" size="lg" className="w-full">
          <Sparkles className="h-4 w-4" /> Generate a mini lesson from this
        </Button>
      </form>
    </div>
  );
}
