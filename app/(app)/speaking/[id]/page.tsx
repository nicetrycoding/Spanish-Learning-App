import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSpeakingAttempt } from "@/services/speaking-service";
import type { SpeakingEvaluation } from "@/lib/ai/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Speaking feedback" };

export default async function SpeakingResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const attempt = await getSpeakingAttempt(session.user.id, id);
  if (!attempt || !attempt.evaluation) notFound();
  const evaluation = attempt.evaluation as unknown as SpeakingEvaluation;

  const scores = [
    { label: "Pronunciation", value: evaluation.pronunciation },
    { label: "Fluency", value: evaluation.fluency },
    { label: "Grammar", value: evaluation.grammar },
    { label: "Vocabulary", value: evaluation.vocabulary },
    { label: "Comprehensibility", value: evaluation.comprehensibility },
    { label: "Pace", value: evaluation.pace },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif-display text-2xl font-semibold">Your speaking feedback</h1>

      <Card>
        <CardContent className="pt-6 italic text-muted-foreground">"{attempt.transcript || "(no speech captured)"}"</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scores.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm text-muted-foreground">{s.label}</span>
              <Progress value={s.value} className="h-1.5 flex-1" />
              <span className="w-10 shrink-0 text-right text-xs">{Math.round(s.value)}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 text-sm leading-relaxed">{evaluation.feedback}</CardContent>
      </Card>

      <Button asChild className="w-full">
        <Link href="/speaking">Practice again</Link>
      </Button>
    </div>
  );
}
