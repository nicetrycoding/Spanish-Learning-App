import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourseLevels, getRecommendedNextLesson } from "@/services/content-service";
import { CEFR_LABELS, LEVEL_COLOR_VAR, levelIndex, type CEFRLevelKey } from "@/lib/cefr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [levels, skillProfile, recommended] = await Promise.all([
    getCourseLevels(),
    db.skillProfile.findUnique({ where: { userId: session.user.id } }),
    getRecommendedNextLesson(session.user.id),
  ]);

  const currentLevel = skillProfile?.overallLevel ?? "A0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl font-semibold sm:text-3xl">Learn</h1>
        <p className="mt-1 text-muted-foreground">Your full curriculum, from absolute beginner to near-native.</p>
      </div>

      {recommended && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Continue learning</p>
              <p className="mt-1 font-serif-display text-lg font-semibold">{recommended.lesson.title}</p>
              <p className="text-sm text-muted-foreground">{recommended.module.title}</p>
            </div>
            <Button asChild>
              <Link href={`/learn/lesson/${recommended.lesson.slug}`}>
                Continue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => {
          const key = level.level as CEFRLevelKey;
          const isCurrent = key === currentLevel;
          const isPast = levelIndex(key) < levelIndex(currentLevel);
          return (
            <Link key={level.id} href={`/learn/${key.toLowerCase()}`}>
              <Card className={isCurrent ? "border-2 border-primary shadow-md" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div
                      className="h-2 w-10 rounded-full"
                      style={{ background: LEVEL_COLOR_VAR[key] }}
                    />
                    {isCurrent && <Badge>Current</Badge>}
                    {isPast && <Badge variant="secondary">Review</Badge>}
                  </div>
                  <CardTitle className="font-serif-display text-xl">
                    {key} · {CEFR_LABELS[key]}
                  </CardTitle>
                  <CardDescription>{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{level._count.modules} modules</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/learn/generate">
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="py-4">
              <p className="font-medium">AI lesson generator</p>
              <p className="text-sm text-muted-foreground">"Teach me Spanish for working in a restaurant"</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/import">
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="py-4">
              <p className="font-medium">Learn from real content</p>
              <p className="text-sm text-muted-foreground">Import an article, transcript, or dialogue</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
