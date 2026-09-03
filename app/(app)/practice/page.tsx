import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDueReviewCount } from "@/services/review-service";
import { SKILL_LABELS, SKILLS } from "@/lib/cefr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Practice" };

const SKILL_BLURB: Record<string, string> = {
  GRAMMAR: "Conjugation, tenses, sentence structure",
  VOCABULARY: "Words, chunks, and collocations",
  READING: "Comprehension and inference",
  LISTENING: "Comprehension at natural speed",
  WRITING: "Short, targeted writing prompts",
  SPEAKING: "Pronunciation and production",
};

export default async function PracticePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dueCount = await getDueReviewCount(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Practice</h1>
        <p className="mt-1 text-muted-foreground">Targeted practice, or catch up on your spaced-repetition review.</p>
      </div>

      <Link href="/practice/review">
        <Card className="border-2 border-accent/30 bg-accent/5 transition-colors hover:border-accent/50">
          <CardContent className="flex items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-accent/10 p-3 text-accent">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif-display text-lg font-semibold">Review</p>
                <p className="text-sm text-muted-foreground">Vocabulary, grammar, and mistakes due right now</p>
              </div>
            </div>
            <Badge variant={dueCount > 0 ? "accent" : "secondary"}>{dueCount} due</Badge>
          </CardContent>
        </Card>
      </Link>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Practice by skill</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((skill) => (
            <Link key={skill} href={`/practice/${skill.toLowerCase()}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="text-base">{SKILL_LABELS[skill]}</CardTitle>
                  <CardDescription>{SKILL_BLURB[skill]}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Link href="/real-world">
        <Card className="transition-colors hover:border-primary/40">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">Real-world Spanish</p>
              <p className="text-sm text-muted-foreground">Restaurant, airport, doctor, job interview, and more</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
