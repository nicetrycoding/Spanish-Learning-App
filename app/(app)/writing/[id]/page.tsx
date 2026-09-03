import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getWritingSubmission } from "@/services/writing-service";
import type { WritingEvaluation } from "@/lib/ai/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Writing feedback" };

export default async function WritingResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const submission = await getWritingSubmission(session.user.id, id);
  if (!submission || !submission.evaluation) notFound();
  const evaluation = submission.evaluation as unknown as WritingEvaluation;

  const scores = [
    { label: "Grammar", value: evaluation.grammar },
    { label: "Vocabulary", value: evaluation.vocabulary },
    { label: "Coherence", value: evaluation.coherence },
    { label: "Naturalness", value: evaluation.naturalness },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          Estimated level: {evaluation.cefr}
        </Badge>
        <h1 className="font-serif-display text-2xl font-semibold">Your writing feedback</h1>
      </div>

      <Card>
        <CardContent className="space-y-1 pt-6 italic text-muted-foreground">"{submission.content}"</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scores.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-muted-foreground">{s.label}</span>
              <Progress value={s.value} className="h-1.5 flex-1" />
              <span className="w-10 shrink-0 text-right text-xs">{Math.round(s.value)}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 text-sm leading-relaxed">{evaluation.overallFeedback}</CardContent>
      </Card>

      {evaluation.corrections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Corrections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {evaluation.corrections.map((c, i) => (
              <div key={i} className="space-y-1 rounded-md border border-border p-3 text-sm">
                <p className="text-destructive">❌ {c.original}</p>
                <p className="text-success">✅ {c.corrected}</p>
                <p className="text-muted-foreground">{c.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Improved version</CardTitle>
        </CardHeader>
        <CardContent className="font-serif-display leading-relaxed">{evaluation.improvedVersion}</CardContent>
      </Card>

      {evaluation.suggestedVocabulary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vocabulary to try next time</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {evaluation.suggestedVocabulary.map((v) => (
              <Badge key={v} variant="outline">
                {v}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Button asChild className="w-full">
        <Link href="/writing">Write another</Link>
      </Button>
    </div>
  );
}
